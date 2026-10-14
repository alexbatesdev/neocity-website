// Standalone: no dependencies. Copy this file (and the .tiled-layer CSS) to reuse elsewhere.
// A fixed, viewport-sized layer whose repeating background scrolls at `speed` x the page scroll.
// speed > 1 reads as foreground (faster than content), < 1 as background.
//
// Markup: <div class="tiled-layer" data-src="..." data-speed="1.6" data-scale="2" data-drift-x="0" data-drift-y="0"></div>
export class TiledParallaxLayer {
  constructor(element, scrollTarget = window) {
    this.element = element;
    this.scrollTarget = scrollTarget;
    this.speed = parseFloat(element.dataset.speed ?? '1.5');
    this.driftX = parseFloat(element.dataset.driftX ?? '0'); // px/sec, optional ambient motion
    this.driftY = parseFloat(element.dataset.driftY ?? '0');
    this.start = performance.now();
    this.ticking = false;

    // Integer scale only: any fractional scale produces uneven "mixel" pixels.
    this.scale = Math.max(1, Math.round(parseFloat(element.dataset.scale ?? '1')));

    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url("${element.dataset.src}")`;
      element.style.backgroundSize = `${img.naturalWidth * this.scale}px ${img.naturalHeight * this.scale}px`;
      scrollTarget.addEventListener('scroll', () => this.requestFrame(), { passive: true });
      if (this.driftX || this.driftY) this.loop();
      else this.render();
    };
    img.src = element.dataset.src;
  }

  requestFrame() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.render();
    });
  }

  loop() {
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  render() {
    const t = (performance.now() - this.start) / 1000;
    // Snap offsets to whole source pixels so every star pixel stays the same size.
    const snap = v => Math.round(v / this.scale) * this.scale;
    const x = snap(-window.scrollX * this.speed + this.driftX * t);
    const y = snap(-window.scrollY * this.speed + this.driftY * t);
    this.element.style.backgroundPosition = `${x}px ${y}px`;
  }

  static initAll(root = document) {
    return Array.from(root.querySelectorAll('.tiled-layer')).map(el => new TiledParallaxLayer(el));
  }
}
