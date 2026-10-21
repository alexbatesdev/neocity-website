import { renderMenu } from '../../js/menu/renderMenu.js';
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

  // In game the camera follows the ship, so it is drawn at the frame center. In document mode it sits
  // at the home menu's start slot instead (blended to the center during the start transition).
  updateRender() {
    const c = this.getRenderCenter();
    this.element.style.transform = `translate(${c.x - this.width / 2}px, ${c.y - this.height / 2}px) rotate(${this.angle}rad)`;
  }

  getRenderCenter() {
    const vc = { x: camera.viewportWidth / 2, y: camera.viewportHeight / 2 };
    const slot = getStartSlot();
    if (gameState === "playing" || !slot) return vc;
    const r = slot.getBoundingClientRect();
    const sx = r.left + r.width / 2;
    return { x: sx + (vc.x - sx) * transitionBlend, y: r.top + r.height / 2 };
  }
}

// --- game state ----------------------------------------------------------------
// "document" (home page: drifting, no input) -> "transitioning" (scrolling the ship to center)
// -> "playing". The home menu is rendered from the shared menu module.
let gameState = "document";
let transitionBlend = 0;
let startSlotEl = null;
const getStartSlot = () =>
  (startSlotEl ??= document.getElementById("doc").shadowRoot?.querySelector("[data-start-slot]") ?? null);


const player = new Player(document.querySelector(".player-ship"));

// --- home document: drift + hand-crafted zone ---------------------------------------
// The zone is not part of the world until the game starts. Then it spawns just off screen, ahead of
// the ship's drift direction, relative to wherever the ship has drifted to.
const handZone = document.querySelector(".hand-zone");
const DRIFT_SPEED = 50;
const DRIFT_HEADING = Math.PI / 3; // radians, 0 = up, clockwise
player.angle = DRIFT_HEADING;
player.vx = Math.sin(DRIFT_HEADING) * DRIFT_SPEED;
player.vy = -Math.cos(DRIFT_HEADING) * DRIFT_SPEED;
player.updateRender();

function spawnHandZone() {
  if (!handZone) return null;
  handZone.hidden = false;
  const zoneReach = Math.hypot(handZone.offsetWidth, handZone.offsetHeight) / 2;
  const screenReach = Math.hypot(camera.viewportWidth, camera.viewportHeight) / 2;
  const dist = zoneReach + screenReach + 200;
  const heading = Math.atan2(player.vx, -player.vy);
  const x = player.x + Math.sin(heading) * dist;
  const y = player.y - Math.cos(heading) * dist;
  // track: keep its transform current even off screen, so children can be targeted from far away
  landmarks.add(handZone, x, y, { track: true });
  // The spot inside the zone the ship flies to: any element, marked in the HTML
  return handZone.querySelector("[data-autopilot-target]") ?? handZone;
}

// World position of an element's center, read from where it is currently drawn. This follows
// anything that moves (CSS animation, parallax, scripted motion) as long as it is rendered.
// The camera is the reference because it is what the last frame was drawn with.
function worldCenterOf(el) {
  const r = el.getBoundingClientRect();
  return {
    x: camera.x + r.left + r.width / 2,
    y: camera.y + r.top + r.height / 2,
  };
}

// Flies the ship to a target and brings it to rest relative to it. Any player input cancels it.
// target: an Element, a {x, y} world point, or a function returning a {x, y} world point
// (so it may move). Options: offset {x, y} aims at a point relative to the target; stopDistance is how far
// from that point (px) the ship comes to rest, e.g. to park in orbit range of a planet (default 0).
class AutoSteer {
  constructor(player) {
    this.player = player;
    this.target = null;
    this.cruiseSpeed = 350; // pixels/sec
    this.deceleration = 250; // pixels/sec², the most the autopilot accelerates or brakes
    this.brakeMargin = 0.85; // <1 plans to brake a little earlier than strictly needed
    this.endRamp = 2; // 1/sec: final approach speed is at most this times the remaining distance
    this.turnRate = 3;
    this.arriveDistance = 15;
    this.active = false;
  }

  start(target, { offset = { x: 0, y: 0 }, stopDistance = 0 } = {}) {
    this.target = target;
    this.offset = offset;
    this.stopDistance = stopDistance;
    this.lastPos = null;
    this.active = !!target;
  }

  cancel() {
    this.active = false;
  }

  resolve() {
    const t = this.target;
    const pos = t instanceof Element ? worldCenterOf(t) : typeof t === "function" ? t() : t;
    return { x: pos.x + this.offset.x, y: pos.y + this.offset.y };
  }

  update(dt) {
    if (!this.active) return;
    const p = this.player;
    const pos = this.resolve();
    const tvx = this.lastPos ? (pos.x - this.lastPos.x) / dt : 0;
    const tvy = this.lastPos ? (pos.y - this.lastPos.y) / dt : 0;
    this.lastPos = pos;

    const dx = pos.x - p.x;
    const dy = pos.y - p.y;
    const dist = Math.hypot(dx, dy);
    const remaining = dist - this.stopDistance; // negative = inside the stop distance
    if (Math.abs(remaining) < this.arriveDistance && Math.hypot(p.vx - tvx, p.vy - tvy) < 10) {
      p.vx = tvx;
      p.vy = tvy;
      return this.cancel();
    }
    // Braking-distance profile: the fastest closing speed from which a constant deceleration can still
    // stop exactly at the stop point is sqrt(2*a*remaining). Following it makes the ship start
    // slowing down early enough to arrive at rest instead of overshooting. Near the end the profile
    // is capped by a linear ramp, since sqrt is infinitely steep at zero.
    const dirX = dx / (dist || 1);
    const dirY = dy / (dist || 1);
    const brakeSpeed = Math.sqrt(2 * this.deceleration * Math.abs(remaining)) * this.brakeMargin;
    const closing = Math.sign(remaining) * Math.min(this.cruiseSpeed, brakeSpeed, Math.abs(remaining) * this.endRamp);

    // Steer the velocity relative to the target toward the profile, with acceleration capped at the
    // same deceleration the profile assumes.
    const wantX = dirX * closing;
    const wantY = dirY * closing;
    const errX = wantX - (p.vx - tvx);
    const errY = wantY - (p.vy - tvy);
    const err = Math.hypot(errX, errY);
    const step = Math.min(err, this.deceleration * dt);
    if (err > 0) {
      p.vx += (errX / err) * step;
      p.vy += (errY / err) * step;
    }
    let diff = Math.atan2(dx, -dy) - p.angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest way around
    p.angle += diff * Math.min(1, this.turnRate * dt);
  }
}

const autoSteer = new AutoSteer(player);
let zoneTarget = null;
function startGame() {
  if (gameState !== "document") return;
  gameState = "transitioning";
  zoneTarget = spawnHandZone();
  document.body.classList.replace("mode-document", "mode-transitioning");
  const doc = document.getElementById("doc");
  const slot = getStartSlot();
  const from = doc.scrollTop;
  let to = from;
  if (slot) {
    const r = slot.getBoundingClientRect();
    to = from + (r.top + r.height / 2 - camera.viewportHeight / 2);
  }
  const duration = 900;
  const t0 = performance.now();
  transition = { doc, from, to, t0, duration };
}
let transition = null;

function stepTransition(now) {
  const { doc, from, to, t0, duration } = transition;
  const p = Math.min(1, (now - t0) / duration);
  const e = p * p * (3 - 2 * p); // smoothstep
  doc.scrollTop = from + (to - from) * e;
  transitionBlend = e;
  if (p > 0.5) document.body.classList.add("doc-fading");
  if (p < 1) return;
  transition = null;
  transitionBlend = 1;
  gameState = "playing";
  document.body.classList.remove("mode-transitioning", "doc-fading");
  autoSteer.start(zoneTarget);
}

// Render every shared menu on the page (home document + pause screen). The ship stays hidden until the
// home menu exists, since it is positioned at the menu's start slot.
player.element.style.visibility = "hidden";
Promise.all(
  Array.from(document.querySelectorAll("[data-menu]")).map((target) =>
    renderMenu(target, {
      mode: target.dataset.menu,
      onAction: (action) => {
        if (action === "start") startGame();
        else if (action === "resume") setPaused(false);
      },
    })
  )
).then(() => {
  player.updateRender();
  player.element.style.visibility = "";
});

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
      if (!action || e.ctrlKey || e.metaKey || e.altKey || gameState !== "playing" || document.body.classList.contains("paused")) return;
      e.preventDefault();
      autoSteer.cancel();
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
  if (on === paused || (on && gameState !== "playing")) return;
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
  if (paused || gameState !== "playing" || e.target.closest(pauseUi)) return;
  if (activePointerId !== null) return;
  autoSteer.cancel();
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
  if (gameState === "playing") {
    // process pointer input once per tick
    pointer.update();
    keyboard.update(delta);
    autoSteer.update(delta);
  }

  // update game entities (in document mode the ship just drifts)
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

  if (transition) stepTransition(now);
  camera.render();
  player.updateRender();
  renderDebugHud();
  requestAnimationFrame(animate);
}

camera.focusOn(player.x, player.y);
camera.render();
requestAnimationFrame(animate);
