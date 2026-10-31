import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

test('local server serves the tool and preserves access boundaries', { timeout: 15000 }, async t => {
  const port = 35000 + Math.floor(Math.random() * 20000);
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [fileURLToPath(new URL('../server.mjs', import.meta.url))], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => { if (server.exitCode === null) { const closed = once(server, 'exit'); server.kill(); await closed; } });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Server exited: ${code}`)));
    server.stderr.on('data', data => reject(new Error(String(data))));
    server.stdout.on('data', data => { if (String(data).includes('Server chạy tại')) resolve(); });
  });
  for (const route of ['/', '/live/overlay.html', '/assets/hall.jpg', '/assets/theme.css',
    '/assets/characters/manifest.js', '/assets/characters/characters.js', '/assets/scene/hall-warm.png']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    await response.arrayBuffer();
  }
  for (const route of ['/live/server.mjs', '/live/package.json', '/.git/config', '/live/%2e%2e%2fREADME.md']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 404, route);
    await response.text();
  }
  assert.equal((await fetch(base, { method: 'HEAD' })).status, 200);
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  const foreignHostStatus = await new Promise((resolve, reject) => {
    http.get(base, { headers: { Host: 'example.com' } }, response => {
      response.resume(); resolve(response.statusCode);
    }).on('error', reject);
  });
  assert.equal(foreignHostStatus, 421);
  const control = new WebSocket(`ws://127.0.0.1:${port}/ws?role=control`, { origin: base });
  t.after(() => control.terminate());
  const [initial] = await once(control, 'message');
  assert.equal(JSON.parse(initial).t, 'state');
  const state = new Promise(resolve => control.on('message', raw => {
    const message = JSON.parse(raw);
    if (message.t === 'settings') resolve(message);
  }));
  control.send(JSON.stringify({ t: 'ctl', cmd: 'settings', settings: { moBpm: 999, autoChant: false } }));
  assert.equal((await state).settings.moBpm, 120);
  const foreign = new WebSocket(`ws://127.0.0.1:${port}/ws?role=control`, { origin: 'https://example.com' });
  t.after(() => foreign.terminate());
  foreign.on('error', () => {});
  const [, rejected] = await once(foreign, 'unexpected-response');
  assert.equal(rejected.statusCode, 401);
  rejected.resume();
});
