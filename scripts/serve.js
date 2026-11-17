const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');
const Progress = require('../src/progress');

const scrypt = promisify(crypto.scrypt);
const root = path.resolve(__dirname, '..');
const maxBytes = 8_000_000;
const sessionMs = 30 * 86400000;
const digest = token => crypto.createHash('sha256').update(token).digest('hex');
const error = (status, message) => Object.assign(new Error(message), { status });

async function json(req) {
  if (req.headers['content-type'] !== 'application/json') throw error(415, 'Envie JSON.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw error(413, 'Dados grandes demais.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks)); }
  catch { throw error(400, 'JSON inválido.'); }
}

function createServer(filename) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE,
      salt TEXT NOT NULL, password_hash TEXT NOT NULL,
      progress TEXT, revision INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sessions (
      hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    );
  `);
  const requests = [];
  let activeAuth = 0;
  function cookie(req) {
    return /(?:^|;\s*)delta_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  }
  function session(req) {
    const token = cookie(req);
    return token && db.prepare(`
      SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.hash = ? AND expires_at > ?
    `).get(digest(token), Date.now());
  }
  function send(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  }
  async function authenticate(req, res, register) {
    const now = Date.now();
    while (requests.length && requests[0] <= now - 60000) requests.shift();
    if (requests.length >= 20 || activeAuth >= 4) throw error(429, 'Muitas tentativas. Aguarde um minuto.');
    requests.push(now);
    activeAuth++;
    try {
      const { username, password } = (await json(req)) || {};
      if (typeof username !== 'string' || !/^[a-z0-9_.-]{3,32}$/i.test(username) ||
          typeof password !== 'string' || password.length < 12 || password.length > 128) {
        throw error(400, 'Use um nome com 3 a 32 letras ASCII, números ou ._- e senha com 12 a 128 caracteres.');
      }
      const name = username.toLowerCase();
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(name);
      const salt = register || !user ? crypto.randomBytes(16).toString('hex') : user.salt;
      const hash = await scrypt(password, salt, 64);
      let id;
      if (register) {
        const result = db.prepare('INSERT OR IGNORE INTO users(username, salt, password_hash) VALUES (?, ?, ?)').run(name, salt, hash.toString('hex'));
        if (!result.changes) throw error(409, 'Esse nome já está em uso.');
        id = result.lastInsertRowid;
      } else {
        const expected = Buffer.from(user?.password_hash || '00'.repeat(64), 'hex');
        if (!crypto.timingSafeEqual(hash, expected) || !user) throw error(401, 'Usuário ou senha inválidos.');
        id = user.id;
      }
      const token = crypto.randomBytes(32).toString('hex');
      const old = cookie(req);
      if (old) db.prepare('DELETE FROM sessions WHERE hash = ?').run(digest(old));
      db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
      db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(digest(token), id, now + sessionMs);
      res.setHeader('Set-Cookie', `delta_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionMs / 1000}`);
      send(res, 200, { username: name });
    } finally { activeAuth--; }
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    try {
      if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) throw error(403, 'Host inválido.');
      const origin = 'http://' + req.headers.host;
      const pathname = new URL(req.url, origin).pathname;
      if (['POST', 'PUT'].includes(req.method) && req.headers.origin !== origin) {
        throw error(403, 'Origem inválida.');
      }
      if (pathname === '/api/register' && req.method === 'POST') return await authenticate(req, res, true);
      if (pathname === '/api/login' && req.method === 'POST') return await authenticate(req, res, false);
      if (pathname === '/api/logout' && req.method === 'POST') {
        const token = cookie(req);
        if (token) db.prepare('DELETE FROM sessions WHERE hash = ?').run(digest(token));
        res.setHeader('Set-Cookie', 'delta_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
        return send(res, 200, {});
      }
      if (pathname === '/api/progress') {
        const user = session(req);
        if (!user) throw error(401, 'Entre para acessar sua trilha.');
        if (req.method === 'GET') return send(res, 200, {
          username: user.username, revision: user.revision,
          progress: user.progress ? JSON.parse(user.progress) : null
        });
        if (req.method === 'PUT') {
          const { progress, revision } = (await json(req)) || {};
          try { Progress.validate(progress); } catch { throw error(400, 'Progresso inválido.'); }
          if (!Number.isSafeInteger(revision) || revision < 0) throw error(400, 'Versão inválida.');
          const result = db.prepare('UPDATE users SET progress = ?, revision = revision + 1 WHERE id = ? AND revision = ?')
            .run(JSON.stringify(progress), user.id, revision);
          if (!result.changes) throw error(409, 'Outra aba salvou primeiro. Exporte este progresso antes de recarregar.');
          return send(res, 200, { revision: revision + 1 });
        }
      }
      if (pathname === '/' && req.method === 'GET') {
        const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html.replace('<head>', '<head><meta name="delta-lab-server" content="sqlite">'));
      }
      throw error(404, 'Página não encontrada.');
    } catch (e) {
      if (!e.status) console.error(e);
      if (!res.headersSent && !res.destroyed) send(res, e.status || 500, { error: e.status ? e.message : 'Erro interno.' });
    }
  });
  server.on('close', () => db.close());
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  const filename = process.env.DELTA_DB || path.join(root, '.data', 'delta-lab.sqlite');
  createServer(filename).listen(port, '127.0.0.1', () => console.log(`Delta Lab: http://127.0.0.1:${port}`));
}
module.exports = { createServer };
