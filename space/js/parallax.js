export class ParallaxScene {
  constructor(container) {
    this.elements = Array.from(container.querySelectorAll('.plax'));
    this.sensitivity = parseFloat(container.dataset.parallaxSensitivity ?? '10');
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
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

    const scale = element.classList.contains('noplax-scale')
      ? 1
      : (1 + speed);
    element.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;
  }
}
