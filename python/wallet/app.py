import os
import base64  # ← нужно для /api/login-passkey/challenge
import json
import threading
from flask import Flask, request, jsonify

from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters

# ===== ВСТАВЬ СВОЙ НОВЫЙ ТОКЕН! =====
TELEGRAM_BOT_TOKEN = "7257412538:AAGMbvVn_tGKkmOcLjd-xOrLMjSbaNKpHMY"
WEBAPP_URL = "https://4bdf4e18c427.ngrok-free.app"
BOT_USERNAME = "anon_game_two_bot"

VAULT = {}
OPS = {}  # для бриджа: статусы операций
app = Flask(__name__)

# --- ВАЖНО: включаем WebAuthn в Permissions-Policy (полезно на Android) ---
@app.after_request
def add_webauthn_header(resp):
    resp.headers["Permissions-Policy"] = "publickey-credentials-get=(self)"
    return resp

# ============ INLINE HTML (WebApp) ============
# ВАЖНО: raw-строка, чтобы { } из JS не ломали Python.
INDEX_HTML = r"""<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>WebApp + Passkey Demo</title>
  <script src="https://telegram.org/js/telegram-web-app.js" crossorigin="anonymous" referrerpolicy="origin"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
    button { padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; margin: 6px 0; background:#fff; cursor:pointer; }
    input, textarea { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd; }
    .row { display:flex; flex-wrap:wrap; gap:8px; }
    .ok { color:#0a0; } .err{color:#a00;} .muted{color:#666;}
    pre#err { white-space: pre-wrap; background:#fff7f7; border:1px solid #ffd2d2; padding:10px; border-radius:8px; display:none; }
    #extSave, #extLogin { display:inline-block; margin-right:8px; }
  </style>
</head>
<body>
  <h2>WebApp + Passkey Demo</h2>
  <div id="who" class="muted">Telegram user: —</div>
  <div id="dbg" style="white-space:pre-wrap; font:12px/1.3 monospace; background:#f7f7f7; padding:10px; border-radius:8px;"></div>

  <div class="row">
    <button id="extSave">Открыть внешний браузер (сохранение)</button>
    <button id="extLogin">Открыть внешний браузер (восстановление)</button>
  </div>

  <div class="row">
    <button id="btnRegister">Регистрация Passkey + сохранить (внутри WebView)</button>
    <button id="btnLogin">Войти через Passkey + восстановить (внутри WebView)</button>
  </div>

  <h4>Данные (демо «кошелёк»)</h4>
  <textarea id="wallet" rows="4" placeholder="Впиши здесь демо-данные"></textarea>
  <div class="row">
    <button id="btnGen">Сгенерировать демо-данные</button>
    <button id="btnClear">Очистить поле</button>
    <button id="btnExport">Экспорт .wallet</button>
    <input id="file" type="file" accept=".wallet" style="max-width:240px"/>
    <button id="btnImport">Импорт из файла</button>
  </div>

  <p id="status" class="muted"></p>
  <pre id="err"></pre>

  <script>
  const errBox = document.getElementById('err');
  window.addEventListener('error', (e) => {
    errBox.style.display = 'block';
    errBox.textContent = "JS Error: " + e.message + "\\n" + (e.filename||"") + ":" + (e.lineno||"") + ":" + (e.colno||"");
  });
  window.addEventListener('unhandledrejection', e => {
    errBox.style.display = 'block';
    const msg = (e.reason && (e.reason.stack || e.reason.message || e.reason)) || 'Unhandled promise rejection';
    errBox.textContent = String(msg);
  });

  document.addEventListener('DOMContentLoaded', async () => {
    let tg = null;
    try { tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null; if (tg) tg.expand(); } catch(_) {}

    const dbg = (label, v) => { const el = document.getElementById('dbg'); el.textContent += `\n${label}: ` + (typeof v === 'string' ? v : JSON.stringify(v, null, 2)); };
    const st = (msg, cls='muted') => { const el=document.getElementById('status'); el.className=cls; el.textContent=msg; };

    dbg('platform', tg?.platform || '(no tg)');
    dbg('initData', tg?.initData || '(empty)');
    dbg('initDataUnsafe', tg?.initDataUnsafe || '(empty)');

    const user = tg?.initDataUnsafe?.user || null;
    const userId = user?.id ? String(user.id) : null;
    const walletEl = document.getElementById('wallet');
    document.getElementById('who').innerText = userId ? "Telegram user: " + userId : "Нет данных о пользователе (запусти из бота)";

    // === IndexedDB helpers
    const IDB_DB = 'crypto_demo', IDB_STORE = 'kv', IDB_KEY_DEMO = 'demoWallet';
    function idbOpen() {
      return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) { resolve(null); return; }
        const req = indexedDB.open(IDB_DB, 1);
        req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE); };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    async function idbGet(key) { const db = await idbOpen(); if (!db) return null; return new Promise((resolve, reject) => { const tx = db.transaction(IDB_STORE, 'readonly'); const store = tx.objectStore(IDB_STORE); const r = store.get(key); r.onsuccess = () => resolve(r.result ?? null); r.onerror = () => reject(r.error); }); }
    async function idbSet(key, value) { const db = await idbOpen(); if (!db) return false; return new Promise((resolve, reject) => { const tx = db.transaction(IDB_STORE, 'readwrite'); const store = tx.objectStore(IDB_STORE); const r = store.put(value, key); r.onsuccess = () => resolve(true); r.onerror = () => reject(r.error); }); }
    async function idbDel(key) { const db = await idbOpen(); if (!db) return false; return new Promise((resolve, reject) => { const tx = db.transaction(IDB_STORE, 'readwrite'); const store = tx.objectStore(IDB_STORE); const r = store.delete(key); r.onsuccess = () => resolve(true); r.onerror = () => reject(r.error); }); }

    try { const savedDemo = await idbGet(IDB_KEY_DEMO); if (typeof savedDemo === 'string' && savedDemo.length) { walletEl.value = savedDemo; st('Загружены сохранённые демо-данные из IndexedDB.', 'ok'); } } catch (e) {}

    // ==== кодировки
    const toB64urlText = (str) => { const utf8 = new TextEncoder().encode(str); let bin = ''; utf8.forEach(b => bin += String.fromCharCode(b)); return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
    const fromB64urlText = (s) => { s=(s||'').replace(/-/g,'+').replace(/_/g,'/'); const bin=atob(s); const bytes=new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i); return new TextDecoder().decode(bytes); };

    function randomOpId() {
      const b = new Uint8Array(16); crypto.getRandomValues(b);
      return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');
    }

    function openExternally(url) {
      const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
      if (tg && typeof tg.openLink === 'function') {
        try { tg.openLink(url, { try_instant_view: false, prefer_external: true }); return; } catch(_) {}
      }
      const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer external'; document.body.appendChild(a); a.click(); a.remove();
    }

    // ★ Пуллинг результата операции (возвращаем и payload при восстановлении)
    let pollTimer = null;
    async function pollOp(op, mode) {
      clearInterval(pollTimer);
      let attempts = 0;
      pollTimer = setInterval(async () => {
        attempts++;
        try {
          const r = await fetch(`/api/bridge/status?op=${encodeURIComponent(op)}`, {cache:'no-store'});
          const j = await r.json();
          if (j.ok && j.status && j.status !== 'pending') {
            clearInterval(pollTimer);
            if (j.status === 'success') {
              if (mode === 'login' && j.payload) {
                const txt = fromB64urlText(j.payload);
                walletEl.value = txt;
                try { await idbSet(IDB_KEY_DEMO, txt); } catch(_) {}
                st("✅ Passkey: восстановлено (через внешний браузер) и сохранено в IndexedDB.", "ok");
              } else {
                await idbSet(IDB_KEY_DEMO, walletEl.value || "");
                st("✅ Passkey: бэкап сохранён (через внешний браузер) и записан в IndexedDB.", "ok");
              }
            } else {
              st("Ошибка Passkey: " + (j.message || 'не удалось'), "err");
            }
          }
        } catch(e) {}
        if (attempts > 120) {
          clearInterval(pollTimer);
          st("Таймаут ожидания результата из внешнего браузера.", "err");
        }
      }, 1000);
    }

    // КНОПКИ внешнего браузера: сохранение и восстановление (автовозврат включён)
    const extSave = document.getElementById('extSave');
    extSave.onclick = async () => {
      const value = (walletEl.value || '').trim();
      if (!value) { st("Введи данные в поле перед сохранением в Passkey.", "err"); return; }
      if (!userId) { st("Нет user_id. Открой из бота.", "err"); return; }
      const op = randomOpId();
      try {
        const u = new URL(window.location.origin + "/bridge");
        u.searchParams.set('op', op);
        u.searchParams.set('action', 'register');
        u.searchParams.set('user_id', userId);
        u.searchParams.set('data', toB64urlText(value));
        u.searchParams.set('autoback', '1'); // ← авто-возврат в Telegram
        openExternally(u.toString());
        st("Открыт внешний браузер для Passkey (сохранение). Ждём результат…", "muted");
        pollOp(op, 'register');
      } catch (e) {
        st("Не удалось открыть внешний браузер", "err");
      }
    };

    const extLogin = document.getElementById('extLogin');
    extLogin.onclick = async () => {
      if (!userId) { st("Нет user_id. Открой из бота.", "err"); return; }
      const op = randomOpId();
      try {
        const u = new URL(window.location.origin + "/bridge");
        u.searchParams.set('op', op);
        u.searchParams.set('action', 'login');
        u.searchParams.set('user_id', userId);
        u.searchParams.set('autoback', '1'); // ← авто-возврат в Telegram
        openExternally(u.toString());
        st("Открыт внешний браузер для Passkey (восстановление). Ждём результат…", "muted");
        pollOp(op, 'login');
      } catch (e) {
        st("Не удалось открыть внешний браузер", "err");
      }
    };

    // ===== Внутренние кнопки (в WebView), как раньше =====
    const te = new TextEncoder();
    const b64 = a => btoa(String.fromCharCode(...new Uint8Array(a)));
    const unb64 = s => Uint8Array.from(atob(s), c=>c.charCodeAt(0)).buffer;

    async function kdf(pwd, salt) {
      const key = await crypto.subtle.importKey("raw", te.encode(pwd), {name:"PBKDF2"}, false, ["deriveKey"]);
      return await crypto.subtle.deriveKey({name:"PBKDF2", hash:"SHA-256", salt, iterations:310000}, key, {name:"AES-GCM", length:256}, true, ["encrypt","decrypt"]);
    }
    async function aesEnc(key, bytes) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, bytes); return { iv: b64(iv), ciphertext: b64(ct) }; }
    let sessionKey = null;
    async function ensureSessionKey() {
      if (sessionKey) return sessionKey;
      const sessionSalt = crypto.getRandomValues(new Uint8Array(16));
      sessionKey = await kdf("demo-pass", sessionSalt);
      return sessionKey;
    }
    async function safeCreate(publicKey) { try { return await navigator.credentials.create({ publicKey }); } catch(e) { return null; } }
    async function safeGet(publicKey) { try { return await navigator.credentials.get({ publicKey }); } catch(e) { return null; } }

    document.getElementById('btnGen').onclick = async () => {
      const rnd = crypto.getRandomValues(new Uint8Array(16));
      const value = "WALLET-" + btoa(String.fromCharCode(...rnd));
      walletEl.value = value;
      try { await idbSet(IDB_KEY_DEMO, value); st("Сгенерировано и сохранено в IndexedDB", "ok"); } catch { st("Сгенерировано (не удалось сохранить в IndexedDB)", "err"); }
    };

    document.getElementById('btnClear').onclick = async () => {
      walletEl.value = "";
      try { await idbDel(IDB_KEY_DEMO); st("Очищено и удалено из IndexedDB", "muted"); } catch { st("Очищено (не удалось удалить из IndexedDB)", "err"); }
    };

    document.getElementById('btnRegister').onclick = async () => {
      try{
        if (!userId) { st("Открой из бота, чтобы был user_id", "err"); return; }
        const cred = await safeCreate({
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp:{ name:"Demo", id: location.hostname },
          user:{ id: new TextEncoder().encode(userId).slice(0,16), name:userId, displayName:userId },
          pubKeyCredParams:[{type:"public-key", alg:-7},{type:"public-key", alg:-257}],
          authenticatorSelection:{ userVerification:"preferred" },
          timeout:60000
        });
        if (!cred) { st('Passkey недоступен в этом окружении.', 'err'); return; }
        const r1 = await fetch("/api/register-passkey", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id:userId, id:cred.id, rawId:b64(cred.rawId), type:cred.type }) });
        const j1 = await r1.json(); if (!j1.ok) throw new Error("register failed");

        const key = await ensureSessionKey();
        const enc = await aesEnc(key, new TextEncoder().encode(walletEl.value || "EMPTY"));
        const raw = await crypto.subtle.exportKey("raw", key);
        const wrappedDEK = b64(raw);
        const r2 = await fetch("/api/store-cipher", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id:userId, ciphertext: enc.ciphertext, iv: enc.iv, wrappedDEK }) });
        const j2 = await r2.json(); if (!j2.ok) throw new Error("store failed");

        await idbSet(IDB_KEY_DEMO, walletEl.value || "");
        st("✅ Бэкап сохранён (внутри WebView).", "ok");
      }catch(e){ errBox.style.display='block'; errBox.textContent=String(e.stack||e); st("Ошибка бэкапа","err"); }
    };

    document.getElementById('btnLogin').onclick = async () => {
      try{
        if (!userId) { st("Открой из бота, чтобы был user_id", "err"); return; }
        const ch = await (await fetch("/api/login-passkey/challenge?user_id="+encodeURIComponent(userId))).json();
        if (!ch.ok) throw new Error("challenge failed");
        const allowIds = (ch.allowCredentialIds || []);
        const challenge = Uint8Array.from(atob(ch.challenge),c=>c.charCodeAt(0));
        const pkOpts = { publicKey: { challenge, userVerification:"preferred", timeout:60000 } };
        if (allowIds.length) pkOpts.publicKey.allowCredentials = allowIds.map(id => ({ type: "public-key", id: Uint8Array.from(atob(id.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)) }));
        const assertion = await safeGet(pkOpts);
        if (!assertion) { st('Вход по Passkey недоступен здесь.', 'err'); return; }

        const v = await (await fetch("/api/login-passkey/verify", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id:userId }) })).json();
        if (!v.ok) throw new Error("verify failed");

        const r = await fetch("/api/retrieve-cipher?user_id="+encodeURIComponent(userId));
        const j = await r.json(); if (!j.ok) throw new Error("нет бэкапа на сервере");
        const { ciphertext, iv, wrappedDEK } = j;
        const key = await crypto.subtle.importKey("raw", Uint8Array.from(atob(wrappedDEK),c=>c.charCodeAt(0)), {name:"AES-GCM"}, false, ["encrypt","decrypt"]);
        const pt = await crypto.subtle.decrypt({name:"AES-GCM", iv: Uint8Array.from(atob(iv),c=>c.charCodeAt(0))}, key, Uint8Array.from(atob(ciphertext),c=>c.charCodeAt(0)));
        const txt = new TextDecoder().decode(pt);
        walletEl.value = txt;
        try { await idbSet(IDB_KEY_DEMO, txt); } catch(_) {}
        st("✅ Восстановлено локально (демо) и сохранено в IndexedDB.", "ok");
      }catch(e){ errBox.style.display='block'; errBox.textContent=String(e.stack||e); st("Ошибка входа/восстановления","err"); }
    };

    // Экспорт/Импорт
    document.getElementById('btnExport').onclick = async () => {
      try{
        const payload = JSON.stringify({ version:1, text: walletEl.value || "" });
        const blob = new Blob([payload], {type:"application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = "mywallet.wallet";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        st("Файл сохранён.", "ok");
      }catch(e){ errBox.style.display='block'; errBox.textContent=String(e.stack||e); st("Ошибка экспорта","err"); }
    };

    document.getElementById('btnImport').onclick = async () => {
      const f = document.getElementById('file').files?.[0];
      if (!f) { st("Выбери файл .wallet","err"); return; }
      try{
        const txt = await f.text();
        walletEl.value = txt;
        try { await idbSet(IDB_KEY_DEMO, walletEl.value); } catch(_) {}
        st("Импорт выполнен и сохранён в IndexedDB.", "ok");
      }catch(e){ errBox.style.display='block'; errBox.textContent=String(e.stack||e); st("Ошибка импорта","err"); }
    };
  });
  </script>
</body>
</html>
"""

# ============ BRIDGE HTML (внешний браузер) ============
# Имя бота подставляем в /bridge через replace("__BOT_USERNAME__", BOT_USERNAME)
BRIDGE_HTML = r"""<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Passkey Bridge</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
    .ok { color:#0a0; } .err{color:#a00;} .muted{color:#666;}
    .row { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
    button { padding:10px 14px; border:1px solid #ddd; border-radius:10px; background:#fff; cursor:pointer; }
  </style>
</head>
<body>
  <h3>Passkey Bridge</h3>
  <p id="status" class="muted">Готовим Passkey…</p>
  <div class="row">
    <button id="backBtn">Вернуться в Telegram</button>
  </div>
  <pre id="err" style="white-space:pre-wrap; display:none;"></pre>

<script>
(async () => {
  const st = (m, cls='muted') => { const el=document.getElementById('status'); el.className=cls; el.textContent=m; };
  const showErr = (m) => { const el=document.getElementById('err'); el.style.display='block'; el.textContent=String(m); };

  const te = new TextEncoder();
  const td = new TextDecoder();
  const b64 = a => btoa(String.fromCharCode(...new Uint8Array(a)));
  const fromB64urlText = (s) => { s = (s || "").replace(/-/g,'+').replace(/_/g,'/'); const bin = atob(s); const bytes = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); };
  const toB64urlText = (str) => { const utf8 = new TextEncoder().encode(str); let bin=''; utf8.forEach(b=>bin+=String.fromCharCode(b)); return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };

  const qp = new URLSearchParams(location.search);
  const op = qp.get('op');
  const action = qp.get('action'); // 'register' | 'login'
  const userId = qp.get('user_id');
  const dataParam = qp.get('data'); // только для register
  const autoBack = qp.get('autoback') === '1';

  const isAndroid = /Android/i.test(navigator.userAgent||'');
  const bot = "__BOT_USERNAME__";

  function goBackToTelegram() {
    const startapp = "bridge_" + (op || "noop");
    const tgDeep = `tg://resolve?domain=${bot}&startapp=${encodeURIComponent(startapp)}`;
    try { window.location.href = tgDeep; } catch(_) {}

    if (isAndroid) {
      setTimeout(() => {
        const https = `https://t.me/${bot}?startapp=${encodeURIComponent(startapp)}`;
        const intent = `intent://resolve?domain=${bot}&startapp=${encodeURIComponent(startapp)}#Intent;scheme=tg;package=org.telegram.messenger;S.browser_fallback_url=${encodeURIComponent(https)};end`;
        try { window.location.href = intent; } catch(_) {}
      }, 180);
    }

    setTimeout(() => {
      const https = `https://t.me/${bot}?startapp=${encodeURIComponent(startapp)}`;
      window.location.href = https;
    }, 360);

    setTimeout(() => { try { window.close(); } catch(_) {} }, 1200);
  }

  const backBtn = document.getElementById('backBtn');
  backBtn.onclick = goBackToTelegram;

  function postResult(status, message, payload) {
    return fetch('/api/bridge/result', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ op, status, message, payload: payload || "" })
    });
  }

  async function kdf(pwd, salt) {
    const key = await crypto.subtle.importKey("raw", te.encode(pwd), {name:"PBKDF2"}, false, ["deriveKey"]);
    return await crypto.subtle.deriveKey({name:"PBKDF2", hash:"SHA-256", salt, iterations:310000}, key, {name:"AES-GCM", length:256}, true, ["encrypt","decrypt"]);
  }
  async function aesEnc(key, bytes) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    an = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, bytes);
    return { iv: b64(iv), ciphertext: b64(an) };
  }

  if (!op || !userId || !action) {
    st('Неверные параметры.', 'err'); return;
  }

  try {
    if (action === 'register') {
      if (!dataParam) throw new Error('Нет data для сохранения');
      const text = fromB64urlText(dataParam);
      st('Запуск Passkey (регистрация)…');

      const cred = await (async () => {
        try {
          return await navigator.credentials.create({
            publicKey: {
              challenge: crypto.getRandomValues(new Uint8Array(32)),
              rp:{ name:"Demo", id: location.hostname },
              user:{ id: new TextEncoder().encode(String(userId)).slice(0,16), name:String(userId), displayName:String(userId) },
              pubKeyCredParams:[{type:"public-key", alg:-7},{type:"public-key", alg:-257}],
              authenticatorSelection:{ userVerification:"preferred" },
              timeout:60000
            }
          });
        } catch(e) { return null; }
      })();
      if (!cred) {
        await postResult('error', 'Passkey недоступен или отменён пользователем'); 
        st('Операция отменена.', 'err');
        if (autoBack) goBackToTelegram();
        return;
      }

      const r1 = await fetch("/api/register-passkey", {
        method:"POST", headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id:String(userId), id:cred.id, rawId:b64(cred.rawId), type:cred.type })
      });
      const j1 = await r1.json(); if (!j1.ok) throw new Error('register failed');

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await kdf("demo-pass", salt);
      const enc = await aesEnc(key, new TextEncoder().encode(text));
      const raw = await crypto.subtle.exportKey("raw", key);
      const wrappedDEK = btoa(String.fromCharCode(...new Uint8Array(raw)));

      const r2 = await fetch("/api/store-cipher", {
        method:"POST", headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id:String(userId), ciphertext: enc.ciphertext, iv: enc.iv, wrappedDEK })
      });
      const j2 = await r2.json(); if (!j2.ok) throw new Error('store failed');

      await postResult('success', 'saved');
      st('✅ Сохранено! Возвращаемся в Telegram…', 'ok');
      if (autoBack) goBackToTelegram();

    } else if (action === 'login') {
      st('Запуск Passkey (восстановление)…');

      const ch = await (await fetch("/api/login-passkey/challenge?user_id="+encodeURIComponent(userId))).json();
      if (!ch.ok) throw new Error("challenge failed");
      const allowIds = (ch.allowCredentialIds || []);
      const challenge = Uint8Array.from(atob(ch.challenge),c=>c.charCodeAt(0));
      const pkOpts = { publicKey: { challenge, userVerification:"preferred", timeout:60000 } };
      if (allowIds.length) pkOpts.publicKey.allowCredentials = allowIds.map(id => ({ type: "public-key", id: Uint8Array.from(atob(id.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)) }));

      const assertion = await (async () => {
        try { return await navigator.credentials.get(pkOpts); } catch(e) { return null; }
      })();
      if (!assertion) {
        await postResult('error', 'Passkey вход отменён или недоступен');
        st('Операция отменена.', 'err');
        if (autoBack) goBackToTelegram();
        return;
      }

      const v = await (await fetch("/api/login-passkey/verify", {
        method:"POST", headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id:String(userId) })
      })).json();
      if (!v.ok) throw new Error("verify failed");

      const r = await fetch("/api/retrieve-cipher?user_id="+encodeURIComponent(userId));
      const j = await r.json(); if (!j.ok) throw new Error("нет бэкапа на сервере");
      const { ciphertext, iv, wrappedDEK } = j;

      const key = await crypto.subtle.importKey("raw", Uint8Array.from(atob(wrappedDEK),c=>c.charCodeAt(0)), {name:"AES-GCM"}, false, ["encrypt","decrypt"]);
      const pt = await crypto.subtle.decrypt({name:"AES-GCM", iv: Uint8Array.from(atob(iv),c=>c.charCodeAt(0))}, key, Uint8Array.from(atob(ciphertext),c=>c.charCodeAt(0)));
      const txt = new TextDecoder().decode(pt);

      await postResult('success', 'restored', toB64urlText(txt));
      st('✅ Восстановлено! Возвращаемся в Telegram…', 'ok');
      if (autoBack) goBackToTelegram();

    } else {
      st('Неизвестное действие.', 'err');
      if (autoBack) goBackToTelegram();
    }
  } catch(e) {
    await postResult('error', String(e && (e.message||e)) );
    st('Ошибка: ' + String(e && (e.message||e)), 'err');
    if (autoBack) goBackToTelegram();
  }
})();
</script>
</body>
</html>
"""

@app.get("/")
def index():
    return INDEX_HTML

@app.get("/bridge")
def bridge():
    # безопасно подставляем имя бота в HTML бриджа
    return BRIDGE_HTML.replace("__BOT_USERNAME__", BOT_USERNAME)

# ---- WebAuthn demo endpoints ----
@app.post("/api/register-passkey")
def api_register_passkey():
    data = request.get_json(force=True)
    user_id = str(data.get("user_id"))
    cred_id = data.get("id")
    raw_id_b64 = data.get("rawId")
    if not user_id or not cred_id or not raw_id_b64:
        return jsonify(ok=False, error="bad_request"), 400
    u = VAULT.get(user_id, {})
    u["credential_id"] = cred_id
    u["raw_id_b64"] = raw_id_b64
    VAULT[user_id] = u
    return jsonify(ok=True)

@app.get("/api/login-passkey/challenge")
def api_login_challenge():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify(ok=False), 400
    challenge = base64.b64encode(os.urandom(32)).decode()
    u = VAULT.get(user_id, {})
    raw_id_b64 = u.get("raw_id_b64")
    allow_ids = [raw_id_b64] if raw_id_b64 else []
    return jsonify(ok=True, challenge=challenge, allowCredentialIds=allow_ids)

@app.post("/api/login-passkey/verify")
def api_login_verify():
    data = request.get_json(force=True)
    user_id = str(data.get("user_id"))
    if not user_id:
        return jsonify(ok=False), 400
    return jsonify(ok=True)

@app.post("/api/store-cipher")
def api_store_cipher():
    data = request.get_json(force=True)
    user_id = str(data.get("user_id"))
    ct, iv, wdek = data.get("ciphertext"), data.get("iv"), data.get("wrappedDEK")
    if not user_id or not ct or not iv or not wdek:
        return jsonify(ok=False), 400
    u = VAULT.get(user_id, {})
    u.update({"ciphertext": ct, "iv": iv, "wrappedDEK": wdek})
    VAULT[user_id] = u
    return jsonify(ok=True)

@app.get("/api/retrieve-cipher")
def api_retrieve_cipher():
    user_id = request.args.get("user_id")
    u = VAULT.get(str(user_id))
    if not u or "ciphertext" not in u:
        return jsonify(ok=False), 404
    return jsonify(ok=True, ciphertext=u["ciphertext"], iv=u["iv"], wrappedDEK=u["wrappedDEK"])

# ---- Bridge ops API ----
@app.get("/api/bridge/status")
def api_bridge_status():
    op = request.args.get("op")
    if not op:
        return jsonify(ok=False, error="no_op"), 400
    s = OPS.get(op)
    if not s:
        return jsonify(ok=True, status="pending")
    return jsonify(ok=True, status=s.get("status","pending"), message=s.get("message",""), payload=s.get("payload",""))

@app.post("/api/bridge/result")
def api_bridge_result():
    data = request.get_json(force=True)
    op = data.get("op")
    status = data.get("status")
    message = data.get("message","")
    payload = data.get("payload","")
    if not op or status not in ("success","error"):
        return jsonify(ok=False, error="bad_request"), 400
    OPS[op] = {"status": status, "message": message, "payload": payload}
    return jsonify(ok=True)

# ---- Telegram bot ----
async def start(update: Update, _):
    kb = [[InlineKeyboardButton(text="Открыть WebApp", web_app=WebAppInfo(url=f"{WEBAPP_URL}/"))]]
    await update.message.reply_text("Открой WebApp (inline-кнопка):", reply_markup=InlineKeyboardMarkup(kb))

def run_flask():
    app.run(host="0.0.0.0", port=8080, debug=True, use_reloader=False)

def run_bot():
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.COMMAND, start))
    application.run_polling()

if __name__ == "__main__":
    t = threading.Thread(target=run_flask, daemon=True)
    t.start()
    run_bot()
