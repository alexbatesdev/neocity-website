import { ParallaxScene } from './parallax.js';
new ParallaxScene(document.querySelector('.the-great-beyond'));

const player_ship = document.querySelector('.player-ship');
let ship_angle = 0;
console.log(player_ship);

// fixed‑timestep accumulator variables (borrowed from game.js)
let lastTime = performance.now();
let accumulator = 0;
const fixedDelta = 1 / 60; // 60 FPS simulation step (seconds)

// Get the viewport middle point
const viewportMiddle = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

// Update the viewport middle point on resize
window.addEventListener('resize', () => {
  viewportMiddle.x = window.innerWidth / 2;
  viewportMiddle.y = window.innerHeight / 2;
});

// --- pointer input manager ------------------------------------------------
class PointerState {
  constructor() {
    this.isDragging = false;
    this.lastPos = { x: 0, y: 0 };
    this.delta = { x: 0, y: 0 };
  }

  onMouseDown(x, y) {
    this.isDragging = true;
    this.lastPos.x = x;
    this.lastPos.y = y;
  }

  onMouseMove(x, y) {
    if (!this.isDragging) return;
    this.delta.x += x - this.lastPos.x;
    this.delta.y += y - this.lastPos.y;
    this.lastPos.x = x;
    this.lastPos.y = y;
  }

  onMouseUp() {
    this.isDragging = false;
  }

  update() {
    if (this.isDragging) {
      // When dragging, recalc pointing each tick using the latest mouse position
      pointShipAt({ clientX: this.lastPos.x, clientY: this.lastPos.y });
      // clear delta since handled
      this.delta.x = 0;
      this.delta.y = 0;
    }
  }
}

const pointer = new PointerState();

function pointShipAt(event) {
  const playerRect = player_ship.getBoundingClientRect();
  const shipCenter = {
    x: playerRect.left + playerRect.width / 2,
    y: playerRect.top + playerRect.height / 2
  };
  const angle = Math.atan2(event.clientY - shipCenter.y, event.clientX - shipCenter.x);
  ship_angle = angle + Math.PI / 2;
  player_ship.style.transform = `rotate(${ship_angle}rad)`;
}

// wire DOM events to pointer manager instead of updating directly
document.addEventListener('mousedown', (e) => pointer.onMouseDown(e.clientX, e.clientY));
document.addEventListener('mousemove', (e) => pointer.onMouseMove(e.clientX, e.clientY));
document.addEventListener('mouseup', () => pointer.onMouseUp());

function updateSimulation(delta) {
    // placeholder for fixed-step logic; delta will equal fixedDelta (1/60)
    // e.g. move objects, advance physics, etc.

    // process pointer input once per tick
    pointer.update();
}

function animate(timestamp) {
    const now = timestamp || performance.now();
    let frameTime = (now - lastTime) / 1000; // convert to seconds
    if (frameTime > 0.25) frameTime = 0.25; // avoid spiral of death
    lastTime = now;
    accumulator += frameTime;

    while (accumulator >= fixedDelta) {
        updateSimulation(fixedDelta);
        accumulator -= fixedDelta;
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
