import { ParallaxScene } from './parallax.js';
new ParallaxScene(document.querySelector('.the-great-beyond'));

// fixed‑timestep accumulator variables (borrowed from game.js)
let lastTime = performance.now();
let accumulator = 0;
const fixedDelta = 1 / 60; // 60 FPS simulation step (seconds)

// Get the viewport middle point
const viewportMiddle = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

// --- player class --------------------------------------------------------
class Player {
  constructor(shipElement) {
    this.element = shipElement;
    // position in world space
    this.x = viewportMiddle.x;
    this.y = viewportMiddle.y;
    // velocity in pixels per second
    this.vx = 0;
    this.vy = 0;
    // rotation in radians
    this.angle = 0;
    // acceleration (thrust) magnitude
    this.thrustMagnitude = 200; // pixels per second squared
    this.isThrustingForward = false;

    this.updateRender();
  }

  // Point the ship toward a world position
  pointToward(worldX, worldY) {
    const elementRect = this.element.getBoundingClientRect();
    const shipCenterX = elementRect.left + elementRect.width / 2;
    const shipCenterY = elementRect.top + elementRect.height / 2;
    this.angle = Math.atan2(worldY - shipCenterY, worldX - shipCenterX) + Math.PI / 2;
  }

  // Apply thrust in the direction the ship is pointing
  applyThrust(deltaTime) {
    if (!this.isThrustingForward) return;
    const accelX = Math.sin(this.angle) * this.thrustMagnitude;
    const accelY = -Math.cos(this.angle) * this.thrustMagnitude;
    this.vx += accelX * deltaTime;
    this.vy += accelY * deltaTime;
  }

  // Update position based on velocity
  update(deltaTime) {
    this.applyThrust(deltaTime);
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.updateRender();
  }

  // Sync visual representation with world state
  updateRender() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}rad)`;
  }
}

const player = new Player(document.querySelector('.player-ship'));

// Update the viewport middle point on resize
window.addEventListener('resize', () => {
  viewportMiddle.x = window.innerWidth / 2;
  viewportMiddle.y = window.innerHeight / 2;
});

// --- pointer input manager ------------------------------------------------
class PointerState {
  constructor(player) {
    this.player = player;
    this.isDragging = false;
    this.lastPos = { x: 0, y: 0 };
  }

  onMouseDown(x, y) {
    this.isDragging = true;
    this.lastPos.x = x;
    this.lastPos.y = y;
    // immediately apply thrust
    this.player.isThrustingForward = true;
  }

  onMouseMove(x, y) {
    if (!this.isDragging) return;
    this.lastPos.x = x;
    this.lastPos.y = y;
  }

  onMouseUp() {
    this.isDragging = false;
    this.player.isThrustingForward = false;
  }

  update() {
    if (this.isDragging) {
      // Update ship pointing each tick toward current mouse position
      this.player.pointToward(this.lastPos.x, this.lastPos.y);
    }
  }
}

const pointer = new PointerState(player);

// wire DOM events to pointer manager
document.addEventListener('mousedown', (e) => pointer.onMouseDown(e.clientX, e.clientY));
document.addEventListener('mousemove', (e) => pointer.onMouseMove(e.clientX, e.clientY));
document.addEventListener('mouseup', () => pointer.onMouseUp());

function updateSimulation(delta) {
    // process pointer input once per tick
    pointer.update();
    
    // update game entities
    player.update(delta);
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
