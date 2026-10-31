import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const overlay = fs.readFileSync(new URL('../overlay.html', import.meta.url), 'utf8');
const playback = overlay.slice(overlay.indexOf('const ttsQ=[];'), overlay.indexOf('/* ======================= effects'));

function player() {
  const audio = [], timers = new Map();
  const context = vm.createContext({
    AC: null, master: {}, duck() {},
    setTimeout(fn, delay) { const id = {}; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    Audio: class {
      constructor(url) { this.url = url; audio.push(this); }
      play() { return this.reject ? Promise.reject(new Error('blocked')) : Promise.resolve(); }
      pause() {}
    },
  });
  vm.runInContext(playback, context);
  const run = code => vm.runInContext(code, context);
  function enable() {
    context.AC = {
      createMediaElementSource() { return { connect() {}, disconnect() {} }; },
      createGain() { return { gain: {}, connect() {}, disconnect() {} }; },
    };
    run('playTTS()');
  }
  function advance() {
    const entry = [...timers].find(([, timer]) => timer.delay === 350);
    assert.ok(entry, 'next playback must be scheduled');
    timers.delete(entry[0]); entry[1].fn();
  }
  return { audio, timers, run, enable, advance };
}

test('audio received before unmute stays bounded and resumes in order', () => {
  const p = player();
  for (let i = 0; i < 20; i++) p.run(`queueTTS('/${i}.mp3')`);
  assert.equal(p.audio.length, 0);
  p.enable();
  assert.equal(p.audio[0].url, '/5.mp3');
  p.audio[0].onended(); p.advance();
  assert.equal(p.audio[1].url, '/6.mp3');
});

test('failed or timed out playback releases the queue exactly once', async () => {
  const p = player();
  p.enable();
  p.run("queueTTS('/first.mp3'); queueTTS('/second.mp3')");
  const finish = p.audio[0].onerror;
  finish(); finish();
  assert.equal(p.timers.size, 1);
  p.advance();
  assert.equal(p.audio[1].url, '/second.mp3');
  p.run("queueTTS('/third.mp3')");
  const timeout = [...p.timers.values()].find(timer => timer.delay === 90000);
  timeout.fn(); p.advance();
  assert.equal(p.audio[2].url, '/third.mp3');
});

test('browser scripts parse successfully', () => {
  for (const file of ['../../index.html', '../control.html', '../overlay.html']) {
    const html = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    for (const [, source] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(source, { filename: file });
  }
});
