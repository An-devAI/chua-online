/* Shared character atlas renderer. Source rectangles retain the generated PNG's alpha. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const catalog = window.ChanhDienCharacterManifest;
  const images = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function load(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = new URL(src, base).href;
    });
  }
  const ready = Promise.all(Object.entries(catalog).map(async ([key, item]) => {
    const image = await load(item.src);
    const fallback = image ? null : await load(item.fallback);
    images.set(key, { image, fallback });
  }));
  function draw(ctx, key, frame, x, y, scale, flip = false) {
    const item = catalog[key] || catalog.man;
    scale *= item.scale;
    const state = images.get(key) || images.get('man');
    if (!state) return 260 * scale;
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
    let height = 260 * scale;
    if (state.image) {
      const rect = item.frames[Math.max(0, Math.min(7, frame))];
      const k = 260 / item.seatedHeight * scale;
      ctx.drawImage(state.image, ...rect, -rect[2] * k / 2, -rect[3] * k, rect[2] * k, rect[3] * k);
      height = rect[3] * k;
    } else if (state.fallback) {
      const image = state.fallback, width = height * image.naturalWidth / image.naturalHeight;
      ctx.drawImage(image, -width / 2, -height, width, height);
    }
    ctx.restore(); return height;
  }
  function cushion(ctx, x, y, scale) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(48,24,12,.24)';
    ctx.beginPath(); ctx.ellipse(0, 6, 123, 38, 0, 0, Math.PI * 2); ctx.fill();
    const fill = ctx.createLinearGradient(0, -35, 0, 18);
    fill.addColorStop(0, '#c7a16c'); fill.addColorStop(1, '#74502e');
    ctx.fillStyle = fill; ctx.strokeStyle = '#e2bd83'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -10, 112, 35, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(83,51,24,.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, -15, 96, 23, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function choices(container, selected = 'man') {
    for (const [key, item] of Object.entries(catalog)) {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.skin = key;
      button.setAttribute('aria-pressed', String(key === selected));
      const canvas = document.createElement('canvas'); canvas.width = 120; canvas.height = 112;
      canvas.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.textContent = item.label;
      button.append(canvas, label); container.append(button);
      ready.then(() => { const ctx = canvas.getContext('2d'); cushion(ctx, 60, 102, .32); draw(ctx, key, 7, 60, 101, .33); });
    }
  }
  function hall(image, src) {
    image.onerror = () => { image.onerror = null; image.src = new URL('../hall.jpg', base).href; };
    image.src = src;
  }
  window.ChanhDienCharacters = Object.freeze({ catalog, ready, draw, cushion, choices, hall,
    reducedMotion, hasAnimation: key => !!images.get(key)?.image });
})();
