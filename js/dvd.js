
// TODO: 
// 1. Lock controlling the logo behind a cheat code
// 2. Make corner detection
// 3. Move the page to it's own directory

const DVDLogo = document.getElementById('dvd-logo');
const DVDLogoImage = document.getElementById('logo-img');

let velocityX = 3;
let velocityY = 3;

let positionX = window.innerWidth / 2;
let positionY = window.innerHeight / 2;

const DVDLogoWidth = DVDLogo.offsetWidth;
const DVDLogoHeight = DVDLogo.offsetHeight;

DVDLogo.style.left = positionX + 'px';
DVDLogo.style.top = positionY + 'px';
DVDLogoImage.style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');

//Pong Mode vvv

let pongMode = false;
const p1Paddle = document.getElementById('p1-paddle');
let p1PaddleY = window.innerHeight / 2;
p1Paddle.style.top = p1PaddleY + 'px';
const p2Paddle = document.getElementById('p2-paddle');
let p2PaddleY = window.innerHeight / 2;
p2Paddle.style.top = p2PaddleY + 'px';

let p1Score = 0;
let p2Score = 0;

//Pong Mode ^^^

//Breakout Mode vvv

let breakoutMode = false;
const BRpaddle = document.getElementById('breakout-paddle');
let BRpaddleX = window.innerWidth / 2;

//Breakout Mode ^^^

let keyState = {
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
    enter: false,
    w: false,
    a: false,
    s: false,
    d: false,
    b: false,
};

let keyLog = [];

document.addEventListener('keydown', (event) => {
    let key = event.key.toLowerCase();
    if (key in keyState) {
        keyState[key] = true;
    }
    if (keyLog.length > 10) {
        keyLog.shift();
    }
    keyLog.push(key);
    console.log(keyLog.join(''));
    //Pong Mode vvv
    if (keyLog.join('') === 'arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftarrowrightbaenter') {
        togglePongMode();
    }
    //Pong Mode ^^^

    //Breakout Mode vvv
    if (keyLog.join('') === 'arrowuparrowdownarrowleftarrowrightaarrowuparrowdownarrowleftarrowrightbenter') {
        toggleBreakoutMode();
    }
    //Breakout Mode ^^^
})

document.addEventListener('keyup', (event) => {
    let key = event.key.toLowerCase();
    if (key in keyState) {
        keyState[key] = false;
    }
});

//Pong Mode vvv
const togglePongMode = () => {
    pongMode = !pongMode;
    document.getElementsByClassName('paddle')[0].classList.toggle('hidden');
    document.getElementsByClassName('paddle')[1].classList.toggle('hidden');
    document.getElementById('pongUI').classList.toggle('hidden');
    if (pongMode) {
        positionX = window.innerWidth / 2;
        positionY = window.innerHeight / 2;
        velocityX = 3;
        velocityY = 3;
        alert('Pong Mode Activated');
        if (Math.random() > 0.5) {
            velocityX *= -1;
        }

        if (Math.random() > 0.5) {
            velocityY *= -1;
        }
    }
}
//Pong Mode ^^^

//Breakout Mode vvv

const toggleBreakoutMode = () => {
    breakoutMode = !breakoutMode;
    alert('Breakout Mode Activated')
    document.getElementById('breakoutUI').classList.toggle('hidden');
    if (breakoutMode) {
        positionX = window.innerWidth / 2;
        positionY = window.innerHeight / 2;
        velocityX = 0;
        velocityY = 3;
        generateBricks();
    }
}

const generateBricks = () => {
    for (let i = 0; i < 70; i++) {
        let brick = document.createElement('div');
        brick.classList.add('brick');
        // brick.style.left = (i * 100) + 'px';
        document.getElementsByClassName('brickContainer')[0].appendChild(brick);
    }
}

//Breakout Mode ^^^

const animate = () => {
    requestAnimationFrame(animate);
    let DVDRect = DVDLogo.getBoundingClientRect();
    //Pong Mode vvv
    let p1Rect = p1Paddle.getBoundingClientRect();
    let p2Rect = p2Paddle.getBoundingClientRect();
    if (pongMode) {
        //left
        if (DVDRect.left < p1Rect.right && DVDRect.right > p1Rect.left && DVDRect.top < p1Rect.bottom && DVDRect.bottom > p1Rect.top) {
            document.getElementById('logo-img').style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');
            let relativeIntersectY = (DVDRect.y + (DVDRect.height / 2)) - (p1Rect.y + (p1Rect.height / 2));
            let normalizedRelativeIntersectionY = (relativeIntersectY / (p1Rect.height / 2));
            let bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4);
            velocityX = Math.cos(bounceAngle) * 15;
            velocityY = Math.sin(bounceAngle) * 15;
        }
        //right
        if (DVDRect.left < p2Rect.right && DVDRect.right > p2Rect.left && DVDRect.top < p2Rect.bottom && DVDRect.bottom > p2Rect.top) {
            document.getElementById('logo-img').style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');
            let relativeIntersectY = (DVDRect.y + (DVDRect.height / 2)) - (p2Rect.y + (p2Rect.height / 2));
            let normalizedRelativeIntersectionY = (relativeIntersectY / (p2Rect.height / 2));
            let bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4);
            velocityX = Math.cos(bounceAngle) * -15;
            velocityY = Math.sin(bounceAngle) * 15;
        }
    }
    //Pong Mode ^^^

    //Breakout Mode vvv
    if (breakoutMode) {
        let BRpaddleRect = BRpaddle.getBoundingClientRect();

        if (DVDRect.bottom > BRpaddleRect.top && DVDRect.top < BRpaddleRect.bottom && DVDRect.left < BRpaddleRect.right && DVDRect.right > BRpaddleRect.left) {
            document.getElementById('logo-img').style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');
            let relativeIntersectX = (DVDRect.x) - (BRpaddleRect.x + (BRpaddleRect.width / 2));
            console.log(DVDRect.x + (DVDRect.width / 2), BRpaddleRect.x + (BRpaddleRect.width / 2))
            console.log(relativeIntersectX);
            let normalizedRelativeIntersectionX = (relativeIntersectX / (BRpaddleRect.width / 2));
            console.log(normalizedRelativeIntersectionX)
            let bounceAngle = normalizedRelativeIntersectionX * (Math.PI / 4);
            console.log(bounceAngle);
            velocityX = Math.cos(bounceAngle) * 6;
            velocityY = Math.sin(bounceAngle) * 6;
        }

        let bricks = document.getElementsByClassName('brick');
        for (let i = 0; i < bricks.length; i++) {
            let brickRect = bricks[i].getBoundingClientRect();
            if (DVDRect.bottom > brickRect.top && DVDRect.top < brickRect.bottom && DVDRect.left < brickRect.right && DVDRect.right > brickRect.left) {
                document.getElementById('logo-img').style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');
                let relativeIntersectX = (DVDRect.x) - (brickRect.x + (brickRect.width / 2));
                let normalizedRelativeIntersectionX = (relativeIntersectX / (brickRect.width / 2));
                let bounceAngle = normalizedRelativeIntersectionX * (Math.PI / 4);
                velocityX = Math.cos(bounceAngle) * 6;
                velocityY = Math.sin(bounceAngle) * 6;
                bricks[i].classList.add('brick-slot')
                bricks[i].classList.remove('brick');
            }
        }
    }
    //Breakout Mode ^^^

    if (positionX + (DVDLogoWidth / 2) >= window.innerWidth || positionX - (DVDLogoWidth / 2) <= 0) {
        velocityX *= -1;
        document.getElementById('logo-img').style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');
        //Pong Mode vvv
        if (pongMode) {
            if (positionX < window.innerWidth / 2) {
                p2Score++;
            } else if (positionX > window.innerWidth / 2) {
                p1Score++;
            }
            positionX = window.innerWidth / 2;
            positionY = window.innerHeight / 2;
            velocityX *= -0.5;
            velocityY *= 0.5;
        }
        //Pong Mode ^^^
    }
    if (positionY + (DVDLogoHeight / 2) >= window.innerHeight || positionY - (DVDLogoHeight / 2) <= 0) {
        velocityY *= -1;
        document.getElementById('logo-img').style.setProperty('--hue-rotato', Math.floor(Math.random() * 360) + 'deg');
        //Breakout Mode vvv
        if (breakoutMode) {
            if (positionY > window.innerHeight / 2) {
                positionX = window.innerWidth / 2;
                positionY = window.innerHeight / 2;
                velocityX = 0;
                velocityY = 3;
            }
        }
    }

    if (!pongMode && !breakoutMode) {

        if (velocityX > 10 || velocityX < -10) {
            velocityX *= 0.99;
        }

        if (velocityY > 10 || velocityY < -10) {
            velocityY *= 0.99;
        }

        if (keyState['arrowup']) {
            velocityY -= 0.2;
        }

        if (keyState['arrowdown']) {
            velocityY += 0.2;
        }

        if (keyState['arrowleft']) {
            velocityX -= 0.2;
        }

        if (keyState['arrowright']) {
            velocityX += 0.2;
        }
    }

    //Pong Mode vvv
    if (pongMode) {
        const PADDLESPEED = 10;
        if (p1Rect.top >= 0) {
            if (keyState['w']) {
                p1PaddleY -= PADDLESPEED;
            }
        }

        if (p1Rect.bottom <= window.innerHeight) {
            if (keyState['s']) {
                p1PaddleY += PADDLESPEED;
            }
        }

        if (p2Rect.top >= 0) {
            if (keyState['arrowup']) {
                p2PaddleY -= PADDLESPEED;
            }
        }

        if (p2Rect.bottom <= window.innerHeight) {
            if (keyState['arrowdown']) {
                p2PaddleY += PADDLESPEED;
            }
        }
    }
    //Pong Mode ^^^

    //Breakout Mode vvv
    if (breakoutMode) {
        const PADDLESPEED = 10;
        if (BRpaddleX - (BRpaddle.offsetWidth / 2) >= 0) {
            if (keyState['a']) {
                BRpaddleX -= PADDLESPEED;
            }
        }

        if (BRpaddleX <= window.innerWidth - (BRpaddle.offsetWidth / 2)) {
            if (keyState['d']) {
                BRpaddleX += PADDLESPEED;
            }
        }
    }

    //Breakout Mode ^^^W

    positionX += velocityX;
    positionY += velocityY;

    DVDLogo.style.left = positionX + 'px';
    DVDLogo.style.top = positionY + 'px';

    //Pong Mode vvv
    if (pongMode) {
        p1Paddle.style.top = p1PaddleY + 'px';
        p2Paddle.style.top = p2PaddleY + 'px';
        document.getElementById('p1-score').innerHTML = p1Score;
        document.getElementById('p2-score').innerHTML = p2Score;
    }
    //Pong Mode ^^^

    //Breakout Mode vvv
    if (breakoutMode) {
        BRpaddle.style.left = BRpaddleX + 'px';
    }
}

requestAnimationFrame(animate);
