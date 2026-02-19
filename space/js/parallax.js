export class ParallaxScene {
  constructor(container) {
    this.elements = Array.from(container.querySelectorAll('.plax'));
    this.sensitivity = parseFloat(container.dataset.parallaxSensitivity ?? '10');
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    const scrollY = window.scrollY;
    this.elements.forEach(el => this.applyParallax(el, scrollY));
  }

  applyParallax(element, scrollY) {
    let zIndex = element.style.zIndex
      || element.computedStyleMap().get('z-index').value;
    const speed = (parseInt(zIndex) / 100) * this.sensitivity;

    let xOffset = 0;
    let yOffset = scrollY * speed;

    if (element.classList.contains('noplax-y')) yOffset = 0;
    if (element.classList.contains('noplax-x')) xOffset = 0;

    element.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${1 + speed})`;
  }
}
