import { ParallaxScene } from "./parallax.js";
new ParallaxScene(document.querySelector(".the-great-beyond"));

// --- camera system -------------------------------------------------------
class Camera {
  constructor(scrollableElement) {
    this.element = scrollableElement;
  }

  // Center viewport on a world position
  focusOn(worldX, worldY) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate scroll position to center the target
    const scrollX = worldX - viewportWidth / 2;
    const scrollY = worldY - viewportHeight / 2;

    // Clamp to valid scroll range
    const maxScrollX = this.element.scrollWidth - viewportWidth;
    const maxScrollY = this.element.scrollHeight - viewportHeight;

    console.log(
      `Camera focus on (${worldX.toFixed(2)}, ${worldY.toFixed(2)}) -> scroll to (${scrollX.toFixed(2)}, ${scrollY.toFixed(2)})`,
    );
    console.log(`Player is at (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`);
    console.log(
      `element scroll position before: (${this.element.scrollLeft.toFixed(2)}, ${this.element.scrollTop.toFixed(2)})`,
    );

    console.log(
      this.element.scrollWidth,
      this.element.scrollHeight,
      viewportWidth,
      viewportHeight,
    );

    this.element.scrollLeft = Math.max(0, Math.min(scrollX, maxScrollX));
    this.element.scrollTop = Math.max(0, Math.min(scrollY, maxScrollY));
  }
}

const camera = new Camera(document.documentElement);

// fixed‑timestep accumulator variables (borrowed from game.js)
let lastTime = performance.now();
let accumulator = 0;
const fixedDelta = 1 / 60; // 60 FPS simulation step (seconds)

// Get the viewport middle point
const viewportMiddle = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

// --- player class --------------------------------------------------------
class Player {
  constructor(shipElement) {
    this.element = shipElement;
    // position in world space (start at center of 5000x5000 world)
    this.x = 2500;
    this.y = 2500;
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
    this.angle =
      Math.atan2(worldY - shipCenterY, worldX - shipCenterX) + Math.PI / 2;
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

const player = new Player(document.querySelector(".player-ship"));

// Update the viewport middle point on resize
window.addEventListener("resize", () => {
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
document.addEventListener("mousedown", (e) =>
  pointer.onMouseDown(e.clientX, e.clientY),
);
document.addEventListener("mousemove", (e) =>
  pointer.onMouseMove(e.clientX, e.clientY),
);
document.addEventListener("mouseup", () => pointer.onMouseUp());

function updateSimulation(delta) {
  // process pointer input once per tick
  pointer.update();

  // update game entities
  player.update(delta);

  // update camera to follow player
  camera.focusOn(player.x, player.y);
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
