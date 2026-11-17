(function (root) {
'use strict';
const enabled = Boolean(document.querySelector('meta[name="delta-lab-server"]'));

async function request(url, method = 'GET', data, keepalive = false) {
  const response = await fetch('/api/' + url, {
    method, keepalive,
    ...(data === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error), { status: response.status });
  return result;
}

function loginScreen(message = '') {
  const app = document.getElementById('app');
  app.innerHTML = `<main id="main" class="main" style="max-width:560px"><section class="card">
    <p class="eyebrow">DELTA LAB</p><h1>Entre na sua trilha</h1>
    <p>Use sua conta para recuperar o progresso salvo neste servidor.</p>
    <form id="account-form">
      <label class="field"><span>Usuário</span><input name="username" autocomplete="username" required minlength="3" maxlength="32" pattern="[a-zA-Z0-9_.\\-]+"></label>
      <label class="field"><span>Senha</span><input name="password" type="password" autocomplete="current-password" required minlength="12" maxlength="128"><small>Use pelo menos 12 caracteres.</small></label>
      <div class="toolbar"><button class="primary" name="action" value="login">Entrar</button><button name="action" value="register">Criar conta</button></div>
    </form><p id="login-status" role="alert"></p></section></main>`;
  const status = document.getElementById('login-status');
  status.textContent = message;
  app.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    for (const button of form.querySelectorAll('button')) button.disabled = true;
    status.textContent = 'Aguarde…';
    try {
      await request(e.submitter?.value || 'login', 'POST', fields);
      location.reload();
    } catch (err) {
      status.textContent = err.message;
      for (const button of form.querySelectorAll('button')) button.disabled = false;
    }
  };
}

async function connect() {
  if (!enabled) return null;
  let account;
  try { account = await request('progress'); }
  catch (err) {
    loginScreen(err.status === 401 ? '' : 'Não foi possível consultar o servidor. Recarregue para tentar novamente.');
    return false;
  }
  let revision = account.revision;
  let pending = null;
  let saving = null;
  let blocked = false;
  let status = 'Progresso salvo no SQLite.';
  function show(message) {
    status = message;
    const el = document.getElementById('sync-status');
    if (el) el.textContent = message;
    const retry = document.getElementById('sync-retry');
    if (retry) retry.hidden = blocked || !pending || Boolean(saving);
  }
  async function flush() {
    if (saving) return saving;
    if (!pending || blocked) return !pending;
    const snapshot = pending;
    pending = null;
    saving = (async () => {
      show('Salvando no SQLite…');
      try {
        const result = await request('progress', 'PUT', { progress: JSON.parse(snapshot), revision }, snapshot.length < 30000);
        revision = result.revision;
        return true;
      } catch (err) {
        pending ||= snapshot;
        blocked = [401, 409].includes(err.status);
        show(blocked ? err.message + ' Exporte um backup em Meu progresso.' : 'Falha ao salvar. Tente novamente ou exporte um backup.');
        return false;
      }
    })();
    const ok = await saving;
    saving = null;
    if (ok && pending) return flush();
    if (ok) show('Progresso salvo no SQLite.');
    else show(status);
    return ok;
  }
  window.addEventListener('beforeunload', e => {
    if (pending || saving) { e.preventDefault(); e.returnValue = ''; }
  });
  window.addEventListener('online', flush);
  return {
    username: account.username,
    get status() { return status; },
    get canRetry() { return Boolean(pending && !saving && !blocked); },
    storage: {
      getItem: () => account.progress ? JSON.stringify(account.progress) : null,
      setItem: (_, raw) => {
        pending = raw;
        if (!blocked) void flush();
      }
    },
    flush,
    async logout() {
      while (saving || pending) {
        if (!(await flush())) throw Error('Há progresso pendente. Exporte seu backup antes de sair.');
      }
      await request('logout', 'POST');
      location.assign('/');
    }
  };
}
root.Account = { connect };
})(window);
