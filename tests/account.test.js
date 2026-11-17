const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { createServer } = require('../scripts/serve');
const { empty } = require('../src/progress');

test('SQLite sessions, user isolation, progress conflicts and restart', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'delta-test-'));
  const db = path.join(dir, 'progress.sqlite');
  let server, base;
  async function start() {
    server = createServer(db);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = 'http://127.0.0.1:' + server.address().port;
  }
  async function stop() {
    if (server?.listening) await new Promise((resolve, reject) =>
      server.close(e => e ? reject(e) : resolve()));
  }
  async function api(route, method = 'GET', payload, cookie, origin = base) {
    const headers = { Origin: origin, ...(cookie ? { Cookie: cookie } : {}) };
    if (payload) headers['Content-Type'] = 'application/json';
    const response = await fetch(base + '/api/' + route, {
      method, headers, body: payload && JSON.stringify(payload)
    });
    const data = await response.json();
    return { status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  const alice = { username: 'alice', password: 'test-only-password' };
  try {
    await start();
    assert.equal((await api('progress')).status, 401);
    assert.equal((await api('register', 'POST', alice, null, 'https://example.com')).status, 403);
    const a = await api('register', 'POST', alice);
    const b = await api('register', 'POST', { ...alice, username: 'bob' });
    assert.equal(a.status, 200);
    assert.equal(b.status, 200);
    assert.equal((await api('register', 'POST', alice)).status, 409);
    assert.equal((await api('login', 'POST', { ...alice, password: 'wrong-password' })).status, 401);
    const state = { ...empty(), lastLesson: 'f1', read: ['f1'], draft: {
      key: 'quiz/lesson/f1', ids: ['f1-q1'], seed: 123, answers: { 'f1-q1': '0' }
    } };
    assert.equal((await api('progress', 'PUT', { revision: 0, progress: state }, a.cookie)).status, 200);
    assert.equal((await api('progress', 'PUT', { revision: 0, progress: state }, a.cookie)).status, 409);
    assert.equal((await api('progress', 'GET', null, b.cookie)).data.progress, null);
    const html = await fetch(base);
    assert.match(await html.text(), /delta-lab-server/);
    assert.equal((await fetch(base + '/.data/delta-lab.sqlite')).status, 404);
    await stop();
    await start();
    const resumed = await api('login', 'POST', alice);
    assert.deepEqual((await api('progress', 'GET', null, resumed.cookie)).data.progress, state);
    assert.equal((await api('logout', 'POST', null, resumed.cookie)).status, 200);
    assert.equal((await api('progress', 'GET', null, resumed.cookie)).status, 401);
  } finally {
    await stop();
    await fs.rm(dir, { recursive: true, force: true });
  }
});
