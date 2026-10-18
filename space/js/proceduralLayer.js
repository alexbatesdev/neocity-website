import { hash, rngFrom } from './rng.js';

// An endless parallax layer. Layer space is a grid of cells; each cell deterministically
// spawns (or not) one image, so revisiting an area shows the same thing and nothing repeats.
//
// Markup: <div class="proc-layer" data-factor="1.4" data-cell="5000" data-chance="0.4" data-seed="7"
//              data-scale="1,1.5" data-images="./a.png|3048,./b.png|1340"></div>
// factor: how fast the layer moves relative to the camera (1 = same as landmarks, >1 foreground, <1 distant).
export class ProceduralLayer {
  constructor(element) {
    this.element = element;
    const d = element.dataset;
    this.factor = parseFloat(d.factor ?? '1');
    this.cell = parseFloat(d.cell ?? '4000');
    this.chance = parseFloat(d.chance ?? '0.5');
    this.seed = parseInt(d.seed ?? '1', 10);
    [this.scaleMin, this.scaleMax] = (d.scale ?? '1,1').split(',').map(parseFloat);
    this.images = d.images.split(',').map(entry => {
      const [src, width] = entry.split('|');
      return { src, width: parseFloat(width) };
    });
    // An item's rotated extent never exceeds its half-diagonal; use the largest for culling.
    const widest = Math.max(...this.images.map(i => i.width)) * this.scaleMax;
    this.margin = widest * 0.75;
    this.active = new Map(); // "cx,cy" -> { el, x, y }
    this.pool = [];
    this.measure();
    window.addEventListener('resize', () => this.measure());
  }

  measure() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
  }

  spawn(cx, cy) {
    const rand = rngFrom(hash(this.seed, cx, cy));
    if (rand() > this.chance) return null;
    const image = this.images[Math.floor(rand() * this.images.length)];
    const scale = this.scaleMin + rand() * (this.scaleMax - this.scaleMin);
    const x = (cx + rand()) * this.cell;
    const y = (cy + rand()) * this.cell;
    const spinDelay = -rand() * 2400;
    const reverse = rand() < 0.5;

    const el = this.pool.pop() ?? this.createElement();
    el.img.src = image.src;
    el.img.style.width = `${image.width * scale}px`;
    el.img.style.animationDelay = `${spinDelay}s`;
    el.img.style.animationDirection = reverse ? 'reverse' : 'normal';
    this.element.appendChild(el.root);
    return { el, x, y };
  }

  createElement() {
    const root = document.createElement('div');
    root.className = 'proc-item';
    const img = document.createElement('img');
    img.className = 'proc-img';
    img.draggable = false;
    root.appendChild(img);
    return { root, img };
  }

  // camX/camY: the world position at the center of the viewport.
  update(camX, camY) {
    const px = camX * this.factor;
    const py = camY * this.factor;
    const reachX = this.vw / 2 + this.margin;
    const reachY = this.vh / 2 + this.margin;
    const x0 = Math.floor((px - reachX) / this.cell);
    const x1 = Math.floor((px + reachX) / this.cell);
    const y0 = Math.floor((py - reachY) / this.cell);
    const y1 = Math.floor((py + reachY) / this.cell);

    for (const [key, item] of this.active) {
      const [cx, cy] = key.split(',').map(Number);
      if (cx < x0 || cx > x1 || cy < y0 || cy > y1) {
        item.el.root.remove();
        this.pool.push(item.el);
        this.active.delete(key);
      }
    }

    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const key = `${cx},${cy}`;
        if (this.active.has(key)) continue;
        const item = this.spawn(cx, cy);
        if (item) this.active.set(key, item);
      }
    }

    for (const item of this.active.values()) {
      const sx = item.x - px + this.vw / 2;
      const sy = item.y - py + this.vh / 2;
      item.el.root.style.transform = `translate(${sx}px, ${sy}px)`;
    }
  }

  static initAll(root = document) {
    return Array.from(root.querySelectorAll('.proc-layer')).map(el => new ProceduralLayer(el));
  }
}
