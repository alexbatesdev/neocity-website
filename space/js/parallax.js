export class ParallaxScene {
  constructor(container) {
    this.elements = Array.from(container.querySelectorAll('.plax'));
    this.initZIndex();
    this.sensitivity = parseFloat(container.dataset.parallaxSensitivity ?? '10');
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
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
    const scrollX = window.scrollX - (document.documentElement.scrollWidth - window.innerWidth) / 2;
    this.elements.forEach(el => this.applyParallax(el, scrollY, scrollX));
  }

  applyParallax(element, scrollY, scrollX) {
    let zIndex = element.style.zIndex
      || element.computedStyleMap().get('z-index').value;
    const speed = (parseInt(zIndex) / 100) * this.sensitivity;

    let xOffset = -(scrollX * speed);
    let yOffset = -(scrollY * speed);

    if (element.classList.contains('noplax-y')) yOffset = 0;
    if (element.classList.contains('noplax-x')) xOffset = 0;

    const scale = element.classList.contains('plax-scale')
      ? (1 + speed)
      : 1;
    element.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;
  }
}
