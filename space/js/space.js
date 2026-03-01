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
    this.thrustMagnitude = 0; // will be set dynamically by pointer manager
    this.isThrustingForward = false;
    // braking damping factor when mouse is over ship
    this.brakingDamping = 0.95; // 5% speed reduction per frame when braking

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

  // Apply braking damping to reduce velocity
  applyBraking(deltaTime) {
    this.vx *= Math.pow(this.brakingDamping, deltaTime * 60);
    this.vy *= Math.pow(this.brakingDamping, deltaTime * 60);
  }

  // Update position based on velocity
  update(deltaTime) {
    this.applyThrust(deltaTime);
    console.log(this.x, this.y);
    if (
      this.x + this.vx * deltaTime > 0 &&
      this.x + this.vx * deltaTime < 5000
    ) {
      this.x += this.vx * deltaTime;
    } else {
      this.vx = 0; // stop horizontal movement if out of bounds
    }

    if (
      this.y + this.vy * deltaTime > 0 &&
      this.y + this.vy * deltaTime < 5000
    ) {
      this.y += this.vy * deltaTime;
    } else {
      this.vy = 0; // stop vertical movement if out of bounds
    }
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
    // distance-based thrust config
    this.maxThrustDistance = 400; // distance at which thrust reaches max
    this.maxThrustMagnitude = 200; // max acceleration in pixels/sec²
    this.brakingDistance = 50; // distance threshold for braking
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

  // Calculate thrust magnitude based on distance from ship to mouse
  calculateThrustFromDistance() {
    const elementRect = this.player.element.getBoundingClientRect();
    const shipCenterX = elementRect.left + elementRect.width / 2;
    const shipCenterY = elementRect.top + elementRect.height / 2;

    const dx = this.lastPos.x - shipCenterX;
    const dy = this.lastPos.y - shipCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If mouse is very close to ship, apply braking instead
    if (distance < this.brakingDistance) {
      return -1; // sentinel value indicating braking mode
    }

    // Scale thrust by distance, capped at maxThrustMagnitude
    const thrust =
      (distance / this.maxThrustDistance) * this.maxThrustMagnitude;
    return Math.min(thrust, this.maxThrustMagnitude);
  }

  update() {
    if (this.isDragging) {
      // Update ship pointing each tick toward current mouse position
      this.player.pointToward(this.lastPos.x, this.lastPos.y);

      // Calculate and set thrust magnitude based on distance
      const thrustMagnitude = this.calculateThrustFromDistance();
      if (thrustMagnitude === -1) {
        // Braking mode
        this.player.isThrustingForward = false;
        this.player.applyBraking(1 / 60);
      } else {
        this.player.isThrustingForward = true;
        this.player.thrustMagnitude = thrustMagnitude;
      }
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
