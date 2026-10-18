// Elements pinned to one exact world coordinate (no parallax), so flying away leaves them behind.
// Markup: <div class="landmark" data-x="-1500" data-y="-800">...</div>   (x/y = center of the element)
export class Landmarks {
  constructor(root = document) {
    this.items = Array.from(root.querySelectorAll('.landmark')).map(el => ({
      el,
      x: parseFloat(el.dataset.x),
      y: parseFloat(el.dataset.y),
      w: el.offsetWidth,
      h: el.offsetHeight,
      visible: true,
    }));
    this.measure();
    window.addEventListener('resize', () => this.measure());
  }

  measure() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
  }

  // camX/camY: the world position at the center of the viewport.
  update(camX, camY) {
    for (const item of this.items) {
      const sx = item.x - camX + this.vw / 2;
      const sy = item.y - camY + this.vh / 2;
      // Spinning content can reach out to the half-diagonal of its box
      const reach = Math.max(item.w, item.h) * 0.75;
      const visible = sx + reach > 0 && sx - reach < this.vw && sy + reach > 0 && sy - reach < this.vh;
      if (visible !== item.visible) {
        item.el.style.visibility = visible ? 'visible' : 'hidden';
        item.visible = visible;
      }
      if (visible) item.el.style.transform = `translate(${sx - item.w / 2}px, ${sy - item.h / 2}px)`;
    }
  }
}
