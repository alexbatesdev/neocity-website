import { ParallaxScene } from './parallax.js';
new ParallaxScene(document.querySelector('.the-great-beyond'));

const player_ship = document.querySelector('.player-ship');
let ship_angle = 0;
console.log(player_ship);

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

let isDragging = false;

function pointShipAt(event) {
  const angle = Math.atan2(event.clientY - viewportMiddle.y, event.clientX - viewportMiddle.x);
  ship_angle = angle + Math.PI / 2;
  player_ship.style.transform = `rotate(${ship_angle}rad)`;
}

document.addEventListener('mousedown', (event) => {
  isDragging = true;
  pointShipAt(event);
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) pointShipAt(event);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});