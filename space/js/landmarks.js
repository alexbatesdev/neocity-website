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

  // Registers an element at a fixed world position. track: keep its transform current even while off
  // screen, so things inside it can be measured (e.g. autopilot targets) from far away.
  add(el, x, y, { track = false } = {}) {
    el.classList.add('landmark');
    this.items.push({ el, x, y, w: el.offsetWidth, h: el.offsetHeight, visible: true, track });
  }

  // Places a landmark just off screen, `heading` radians (0 = up, clockwise) from `near` ({x, y} in world
  // space), so it appears ahead of the player wherever they have flown to. Returns the world position.
  // margin: extra px of clearance beyond the screen edge.
  spawn(el, { near, heading, margin = 200, track = true }) {
    el.hidden = false;
    const reach = Math.hypot(el.offsetWidth, el.offsetHeight) / 2;
    const screenReach = Math.hypot(this.vw, this.vh) / 2;
    const dist = reach + screenReach + margin;
    const x = near.x + Math.sin(heading) * dist;
    const y = near.y - Math.cos(heading) * dist;
    this.add(el, x, y, { track });
    return { x, y };
  }

  // What the autopilot should fly to for a landmark: its [data-autopilot-target] child (or the landmark
  // itself), plus the optional data-stop-distance (px) set on that element.
  static autopilotTarget(el) {
    const target = el.querySelector('[data-autopilot-target]') ?? el;
    return { target, stopDistance: parseFloat(target.dataset.stopDistance) || 0 };
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
      if (visible || item.track) item.el.style.transform = `translate(${sx - item.w / 2}px, ${sy - item.h / 2}px)`;
    }
  }
}
