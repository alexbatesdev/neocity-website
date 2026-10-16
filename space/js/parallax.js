export class ParallaxScene {
  constructor(container) {
    this.container = container;
    this.elements = Array.from(container.querySelectorAll('.plax'));
    this.initZIndex();
    this.sensitivity = parseFloat(container.dataset.parallaxSensitivity ?? '10');
    this.measure();
    // Cache per-element data so updates do no style/layout reads
    this.items = this.elements.map(el => {
      const speed = (parseInt(el.style.zIndex || getComputedStyle(el).zIndex) / 100) * this.sensitivity;
      return {
        el,
        speed,
        noX: el.classList.contains('noplax-x'),
        noY: el.classList.contains('noplax-y'),
        scale: el.classList.contains('plax-scale') ? 1 + speed : 1,
      };
    });
    window.addEventListener('resize', () => this.measure());
  }

  // Layout read happens only at init/resize. Offsets are relative to the world's center.
  measure() {
    this.centerOffset = (this.container.offsetWidth - window.innerWidth) / 2;
  }

  initZIndex() {
    this.elements.forEach(element => {
      const classes = Array.from(element.classList);
      const zClass = classes.find(cls => cls.startsWith('z'));
        if (zClass) {
            element.style.zIndex = zClass.substring(1);
        }
    });
  }

  // Driven by the camera position (top-left of the viewport in world space)
  update(cameraX, cameraY) {
    const scrollX = cameraX - this.centerOffset;
    for (const item of this.items) this.applyParallax(item, cameraY, scrollX);
  }

  applyParallax(item, scrollY, scrollX) {
    const xOffset = item.noX ? 0 : -(scrollX * item.speed);
    const yOffset = item.noY ? 0 : -(scrollY * item.speed);

    // Individual properties avoid clashing with CSS animations that use `transform`.
    item.el.style.translate = `${xOffset}px ${yOffset}px`;
    item.el.style.scale = `${item.scale}`;
  }
}
