import { rngFrom } from './rng.js';

// Fills any `.tiled-layer[data-generate-stars]` with a seamless, procedurally drawn sparse star tile,
// so no image asset is needed. Must run before TiledParallaxLayer.initAll().
// Markup: <div class="tiled-layer" data-generate-stars="40" data-tile="1024" data-seed="5" data-speed="0.04" data-scale="2"></div>
export function generateStarTiles(root = document) {
  for (const el of root.querySelectorAll('.tiled-layer[data-generate-stars]')) {
    const count = parseInt(el.dataset.generateStars, 10);
    const size = parseInt(el.dataset.tile ?? '1024', 10);
    const rand = rngFrom(parseInt(el.dataset.seed ?? '1', 10));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const tints = ['255,255,255', '200,220,255', '255,235,210'];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rand() * size);
      const y = Math.floor(rand() * size);
      const alpha = 0.35 + rand() * 0.65;
      ctx.fillStyle = `rgba(${tints[Math.floor(rand() * tints.length)]},${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
    el.dataset.src = canvas.toDataURL('image/png');
  }
}
