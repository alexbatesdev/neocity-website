// Standalone: no dependencies. Copy this file (and the .tiled-layer CSS) to reuse elsewhere.
// A fixed, viewport-sized layer whose repeating background scrolls at `speed` x the camera position passed to update().
// speed > 1 reads as foreground (faster than content), < 1 as background.
//
// Markup: <div class="tiled-layer" data-src="..." data-speed="1.6" data-scale="2" data-drift-x="0" data-drift-y="0"></div>
export class TiledParallaxLayer {
  constructor(element) {
    this.element = element;
    this.scrollX = 0;
    this.scrollY = 0;
    this.speed = parseFloat(element.dataset.speed ?? '1.5');
    this.driftX = parseFloat(element.dataset.driftX ?? '0'); // px/sec, optional ambient motion
    this.driftY = parseFloat(element.dataset.driftY ?? '0');
    this.start = performance.now();

    // Integer scale only: any fractional scale produces uneven "mixel" pixels.
    this.scale = Math.max(1, Math.round(parseFloat(element.dataset.scale ?? '1')));

    const img = new Image();
    this.img = img;
    this.isGif = /\.gif($|\?)/i.test(element.dataset.src);
    if (this.isGif) {
      // Attached (but invisible) so the browser keeps animating it and drawImage grabs the live frame.
      img.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
      img.setAttribute('aria-hidden', 'true');
      document.body.appendChild(img);
    }
    this.pausedAt = null;
    this.pausedTotal = 0;
    this.snapshotUrl = null;
    img.onload = () => {
      this.loaded = true;
      element.style.backgroundImage = `url("${element.dataset.src}")`;
      element.style.backgroundSize = `${img.naturalWidth * this.scale}px ${img.naturalHeight * this.scale}px`;
      if (this.driftX || this.driftY) this.loop();
      else this.render();
      if (this.pausedAt !== null) this.freezeGif();
    };
    img.src = element.dataset.src;
  }

  pause() {
    if (this.pausedAt !== null) return;
    this.pausedAt = performance.now();
    this.freezeGif();
  }

  resume() {
    if (this.pausedAt === null) return;
    this.pausedTotal += performance.now() - this.pausedAt;
    this.pausedAt = null;
    if (this.snapshotUrl) {
      URL.revokeObjectURL(this.snapshotUrl);
      this.snapshotUrl = null;
      // Re-assigning the original URL restarts the GIF (frame-exact resume would need a decoder).
      this.element.style.backgroundImage = `url("${this.element.dataset.src}")`;
    }
  }

  // GIFs can't be paused directly: swap the background for a snapshot of the current frame.
  freezeGif() {
    if (!this.isGif || !this.loaded || this.snapshotUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = this.img.naturalWidth;
    canvas.height = this.img.naturalHeight;
    canvas.getContext('2d').drawImage(this.img, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      if (this.pausedAt === null) return; // resumed before the snapshot was ready
      this.snapshotUrl = URL.createObjectURL(blob);
      this.element.style.backgroundImage = `url("${this.snapshotUrl}")`;
    });
  }

  // Call each frame with the camera position; drifting layers render on their own loop.
  update(x, y) {
    this.scrollX = x;
    this.scrollY = y;
    if (!this.driftX && !this.driftY && this.loaded) this.render();
  }

  loop() {
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  render() {
    const t = ((this.pausedAt ?? performance.now()) - this.start - this.pausedTotal) / 1000;
    // Snap offsets to whole source pixels so every star pixel stays the same size.
    const snap = v => Math.round(v / this.scale) * this.scale;
    const x = snap(-this.scrollX * this.speed + this.driftX * t);
    const y = snap(-this.scrollY * this.speed + this.driftY * t);
    this.element.style.backgroundPosition = `${x}px ${y}px`;
  }

  static initAll(root = document) {
    return Array.from(root.querySelectorAll('.tiled-layer')).map(el => new TiledParallaxLayer(el));
  }
}
