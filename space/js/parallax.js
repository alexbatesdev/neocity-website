export class ParallaxScene {
  constructor(container) {
    this.elements = Array.from(container.querySelectorAll('.plax'));
    this.initZIndex();
    this.sensitivity = parseFloat(container.dataset.parallaxSensitivity ?? '10');
    this.ticking = false;
    this.measure();
    // Cache per-element data so the scroll path does no style/layout reads
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
    window.addEventListener('resize', () => { this.measure(); this.requestUpdate(); });
    window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
    this.update();
  }

  measure() {
    this.centerOffset = (document.documentElement.scrollWidth - window.innerWidth) / 2;
  }

  requestUpdate() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
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

  update() {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX - this.centerOffset;
    for (const item of this.items) this.applyParallax(item, scrollY, scrollX);
  }

  applyParallax(item, scrollY, scrollX) {
    const xOffset = item.noX ? 0 : -(scrollX * item.speed);
    const yOffset = item.noY ? 0 : -(scrollY * item.speed);

    // Individual properties avoid clashing with CSS animations that use `transform`.
    item.el.style.translate = `${xOffset}px ${yOffset}px`;
    item.el.style.scale = `${item.scale}`;
  }
}
