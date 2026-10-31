import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../../assets/characters/', import.meta.url);
const source = fs.readFileSync(new URL('manifest.js', root), 'utf8');
const manifestContext = { window: {} };
vm.runInNewContext(source, manifestContext);
const catalog = manifestContext.window.ChanhDienCharacterManifest;

test('all seven character atlases contain eight valid poses and a local fallback', () => {
  assert.deepEqual(Object.keys(catalog).sort(), ['child','granny','man','master','monk','nun','woman']);
  for (const [key, item] of Object.entries(catalog)) {
    const png = fs.readFileSync(new URL(item.src, root));
    assert.equal(png.subarray(1, 4).toString(), 'PNG', key);
    assert.equal(png.readUInt32BE(16), item.sheetWidth, key);
    assert.equal(png.readUInt32BE(20), item.sheetHeight, key);
    assert.equal(png[25], 6, `${key} must retain its RGBA channel`);
    assert.ok(fs.existsSync(new URL(item.fallback, root)), key);
    assert.equal(item.frames.length, 8, key);
    for (const [x,y,w,h] of item.frames) {
      assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0, key);
      assert.ok(x+w <= item.sheetWidth && y+h <= item.sheetHeight, key);
    }
    assert.equal(item.seatedHeight, item.frames[7][3], key);
    assert.ok(item.frames[4][3] > item.frames[7][3], `${key} must lower into its seated pose`);
  }
  assert.notEqual(catalog.master.src, catalog.monk.src);
  assert.ok(catalog.child.scale < catalog.man.scale);
});

async function renderer(failAtlas = false) {
  const draws = [];
  const context = vm.createContext({ URL, Promise,
    window: { ChanhDienCharacterManifest: catalog },
    document: { currentScript: { src: 'http://localhost/assets/characters/characters.js' } },
    matchMedia: () => ({ matches: false }),
    Image: class {
      naturalWidth = 192; naturalHeight = 260;
      set src(value) { this.url = value; queueMicrotask(() => {
        if (failAtlas && value.includes('/characters/')) this.onerror(); else this.onload();
      }); }
    },
  });
  vm.runInContext(fs.readFileSync(new URL('characters.js', root), 'utf8'), context);
  const api = context.window.ChanhDienCharacters;
  await api.ready;
  const ctx = { save(){}, restore(){}, translate(){}, scale(){}, drawImage(...args){ draws.push(args); } };
  return { api, ctx, draws };
}

test('shared renderer draws each pose from its own atlas with a stable seated scale', async () => {
  const { api, ctx, draws } = await renderer();
  for (const [key, item] of Object.entries(catalog)) {
    assert.equal(api.hasAnimation(key), true);
    for (let frame=0; frame<8; frame++) {
      const height = api.draw(ctx, key, frame, 300, 600, .4);
      const draw = draws.at(-1);
      assert.ok(draw[0].url.endsWith('/'+item.src));
      assert.deepEqual(draw.slice(1,5), Array.from(item.frames[frame]));
      assert.ok(Number.isFinite(height) && height>0);
      if (frame===7) assert.ok(Math.abs(height-260*.4*item.scale)<.001);
    }
  }
});

test('failed new images draw the original local character instead', async () => {
  const { api, ctx, draws } = await renderer(true);
  for (const key of Object.keys(catalog)) {
    assert.equal(api.hasAnimation(key), false);
    assert.ok(api.draw(ctx,key,7,0,0,.4)>0);
    assert.ok(draws.at(-1)[0].url.includes('/c_'));
  }
});
