import { ProceduralLayer } from './proceduralLayer.js';
import { Landmarks } from './landmarks.js';
import { generateStarTiles } from './starTile.js';
import { TiledParallaxLayer } from './tiledParallaxLayer.js';
const proceduralLayers = ProceduralLayer.initAll();
const landmarks = new Landmarks();
generateStarTiles();
const tiledLayers = TiledParallaxLayer.initAll();

// --- camera system -------------------------------------------------------
// The world is unbounded and the camera is just numbers: x/y is the world position at the
// viewport's top-left. Everything on screen is positioned relative to it each frame.
class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.measure();
    window.addEventListener("resize", () => this.measure());
  }

  measure() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
  }

  // Center viewport on a world position
  focusOn(worldX, worldY) {
    this.x = worldX - this.viewportWidth / 2;
    this.y = worldY - this.viewportHeight / 2;
  }

  // Write all camera-dependent styles once per frame
  render() {
    const cx = this.x + this.viewportWidth / 2;
    const cy = this.y + this.viewportHeight / 2;
    for (const layer of proceduralLayers) layer.update(cx, cy);
    landmarks.update(cx, cy);
    for (const layer of tiledLayers) layer.update(this.x, this.y);
  }
}

const camera = new Camera();

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
    this.width = this.element.getBoundingClientRect().width;
    this.height = this.element.getBoundingClientRect().height;

    // position in world space: the ship's center; the world starts at (0, 0)
    this.x = 0;
    this.y = 0;
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

  // Ship center in viewport coordinates: the camera always follows, so it is the viewport center
  getScreenCenter() {
    return {
      x: camera.viewportWidth / 2,
      y: camera.viewportHeight / 2,
    };
  }

  pointToward(screenX, screenY) {
    const c = this.getScreenCenter();
    this.angle = Math.atan2(screenY - c.y, screenX - c.x) + Math.PI / 2;
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
  applyBraking(deltaTime, damping = this.brakingDamping) {
    this.vx *= Math.pow(damping, deltaTime * 60);
    this.vy *= Math.pow(damping, deltaTime * 60);
  }

  // Update position based on velocity
  update(deltaTime) {
    this.applyThrust(deltaTime);
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.updateRender();
  }

  // The world is infinite and the camera always follows, so the ship is drawn at the frame center.
  updateRender() {
    const x = camera.viewportWidth / 2 - this.width / 2;
    const y = camera.viewportHeight / 2 - this.height / 2;
    this.element.style.transform = `translate(${x}px, ${y}px) rotate(${this.angle}rad)`;
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
    const c = this.player.getScreenCenter();

    const dx = this.lastPos.x - c.x;
    const dy = this.lastPos.y - c.y;
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

// --- keyboard input (Asteroids style) --------------------------------------
// Left/right (A/D) rotate the ship, up (W) thrusts along its heading, down (S) brakes.
// Pointer dragging takes over steering while active.
class KeyboardState {
  constructor(player, pointer) {
    this.player = player;
    this.pointer = pointer;
    this.keys = new Set();
    this.turnRate = 2.5; // radians per second
    this.thrust = 150; // pixels/sec²
    this.brakeDamping = 0.97; // per-frame speed retention while braking (closer to 1 = softer)
    const map = {
      ArrowLeft: "left", KeyA: "left",
      ArrowRight: "right", KeyD: "right",
      ArrowUp: "up", KeyW: "up",
      ArrowDown: "down", KeyS: "down",
    };
    window.addEventListener("keydown", (e) => {
      const action = map[e.code];
      if (!action || e.ctrlKey || e.metaKey || e.altKey || document.body.classList.contains("paused")) return;
      e.preventDefault();
      this.keys.add(action);
    });
    window.addEventListener("keyup", (e) => {
      const action = map[e.code];
      if (action) this.keys.delete(action);
    });
    window.addEventListener("blur", () => this.keys.clear());
  }

  update(deltaTime) {
    if (this.pointer.isDragging) return;
    const k = this.keys;
    const turn = (k.has("right") ? 1 : 0) - (k.has("left") ? 1 : 0);
    this.player.angle += turn * this.turnRate * deltaTime;
    this.player.isThrustingForward = k.has("up");
    this.player.thrustMagnitude = this.thrust;
    if (k.has("down")) this.player.applyBraking(deltaTime, this.brakeDamping);
  }
}

const keyboard = new KeyboardState(player, pointer);

// --- debug overlay -----------------------------------------------------------
// Toggle with the ` key (or add ?debug to the URL); the choice is remembered.
const debugHud = document.querySelector(".debug-hud");
const homeLandmark = document.querySelector(".black-hole");
function setDebug(on) {
  document.body.classList.toggle("debug", on);
  localStorage.setItem("space-debug", on ? "1" : "0");
}
setDebug(
  new URLSearchParams(location.search).has("debug") ||
    localStorage.getItem("space-debug") === "1"
);
window.addEventListener("keydown", (e) => {
  if (e.code === "Backquote") setDebug(!document.body.classList.contains("debug"));
});

function renderDebugHud() {
  if (!document.body.classList.contains("debug")) return;
  const hole = {
    x: parseFloat(homeLandmark.dataset.x),
    y: parseFloat(homeLandmark.dataset.y),
  };
  const dx = hole.x - player.x;
  const dy = hole.y - player.y;
  const dist = Math.hypot(dx, dy);
  const bearing = (Math.atan2(dx, -dy) * 180) / Math.PI; // 0 = up, clockwise
  const speed = Math.hypot(player.vx, player.vy);
  debugHud.textContent =
    `pos ${player.x.toFixed(0)}, ${player.y.toFixed(0)}  speed ${speed.toFixed(0)}\n` +
    `black hole: ${dist.toFixed(0)}px away, bearing ${((bearing + 360) % 360).toFixed(0)}° (0=up)`;
}

// --- pause ---------------------------------------------------------------------
let paused = false;
const pauseUi = "#pause-btn, #pause";

function setPaused(on) {
  if (on === paused) return;
  paused = on;
  document.body.classList.toggle("paused", on);
  if (on) {
    activePointerId = null;
    pointer.onMouseUp();
    keyboard.keys.clear();
    player.isThrustingForward = false;
    for (const layer of tiledLayers) layer.pause();
  } else {
    for (const layer of tiledLayers) layer.resume();
    lastTime = performance.now();
    accumulator = 0;
  }
}

document.getElementById("pause-btn").addEventListener("click", () => setPaused(true));
document.getElementById("resume-btn").addEventListener("click", () => setPaused(false));
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape" && !e.repeat) setPaused(!paused);
});
window.addEventListener("blur", () => setPaused(true));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setPaused(true);
});

// wire DOM events to pointer manager
// Pointer events unify mouse, touch and pen; track a single active pointer.
let activePointerId = null;
document.addEventListener("pointerdown", (e) => {
  if (paused || e.target.closest(pauseUi)) return;
  if (activePointerId !== null) return;
  activePointerId = e.pointerId;
  pointer.onMouseDown(e.clientX, e.clientY);
});
document.addEventListener("pointermove", (e) => {
  if (e.pointerId !== activePointerId) return;
  pointer.onMouseMove(e.clientX, e.clientY);
});
const endPointer = (e) => {
  if (e.pointerId !== activePointerId) return;
  activePointerId = null;
  pointer.onMouseUp();
};
document.addEventListener("pointerup", endPointer);
document.addEventListener("pointercancel", endPointer);
// Prevent the long-press context menu on touch devices
document.addEventListener("contextmenu", (e) => {
  if (activePointerId !== null) e.preventDefault();
});

function updateSimulation(delta) {
  // process pointer input once per tick
  pointer.update();
  keyboard.update(delta);

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
    if (!paused) updateSimulation(fixedDelta);
    accumulator -= fixedDelta;
  }

  camera.render();
  renderDebugHud();
  requestAnimationFrame(animate);
}

camera.focusOn(player.x, player.y);
camera.render();
requestAnimationFrame(animate);
