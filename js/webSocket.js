let websocket;
let cursors = {};
let my_id = uuidv4();

const Action = Object.freeze({
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    MESSAGE: "message",
    POSITIONS: "positions",
    MOVE: "move"
});

// Class for Coords
class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Class for WebSocketMessage
class WebSocketMessage {
    constructor(action, coords, message, user_id) {
        this.action = action;
        this.coords = coords;
        this.message = message;
        this.user_id = user_id;
    }
}

const connectWS = () => {
    console.log("Connecting to the server with id: " + my_id);
    websocket = new WebSocket(`ws://localhost:8000/ws/${my_id}`);
    websocket.onopen = function () {
        console.log("Connected to the server");
    }
    websocket.onmessage = function (event) {
        console.log(event.data);
        let message = JSON.parse(event.data);
        handleMessage(message);
    }
    websocket.onclose = function () {
        console.log("Disconnected from the server");
    }
}

const disconnectWS = () => {
    websocket.close();
}

const sendMessage = (message) => {
    websocket.send(JSON.stringify(new WebSocketMessage(
        Action.MESSAGE,
        new Coords(0, 0),
        message,
        my_id
    )));
}

const handleMessage = (message) => {
    console.log(message.action)
    switch (message.action) {
        case Action.CONNECT:
            console.log("User connected");
            break;
        case Action.DISCONNECT:
            console.log("User disconnected");
            break;
        case Action.MESSAGE:
            console.log("Message received");
            break;
        case Action.POSITIONS:
            console.log("Positions received");
            console.log(message.message);
            let messageParsed = JSON.parse(message.message);
            console.log(messageParsed);
            let keys = Object.keys(messageParsed);
            for (let key of keys) {
                let coords = percentToCoordinate(messageParsed[key].x, messageParsed[key].y);
                applyCursor(key, coords.x, coords.y);
            }
            // for cursor in cursors (and not my_id)
            // Convert percent to coordinate
            // Call applyCursor
            break;
        default:
            console.log("Unknown action");
            break;
    }
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

const applyCursor = (id, x, y) => {
    if (cursors[id]) {
        updateCursorCoords(id, x, y);
    } else {
        const element = document.createElement("span");
        element.style.position = "absolute";
        element.style.left = x + "px";
        element.style.top = y + "px";
        element.style.width = "10px";
        element.style.height = "10px";
        if (id === my_id) {
            element.style.backgroundColor = "blue";
        } else {
            element.style.backgroundColor = "red";
        }
        element.style.borderRadius = "50%";
        cursors[id] = { cursor: element, x: x, y: y };
        document.body.appendChild(element);
    }
}


const coordinateToPercent = (x, y) => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let percentX = x / width * 100;
    let percentY = y / height * 100;
    return new Coords(percentX, percentY);
}

const percentToCoordinate = (percentX, percentY) => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let x = percentX / 100 * width;
    let y = percentY / 100 * height;
    return new Coords(x, y);
}

const updateCursorCoords = (id, x, y) => {
    cursors[id].cursor.style.left = x + "px";
    cursors[id].cursor.style.top = y + "px";
    cursors[id].x = x;
    cursors[id].y = y;
}

let lastMessageSentAt = 0;
let messageInterval = 45;
document.addEventListener("mousemove", (event) => {
    let coords = coordinateToPercent(event.clientX, event.clientY);
    let message = new WebSocketMessage(Action.MOVE, coords, "", my_id);
    if (Date.now() - lastMessageSentAt > messageInterval) {
        console.log("Sending message");
        lastMessageSentAt = Date.now();
        console.log(message)
        const coords2 = percentToCoordinate(coords.x, coords.y);
        applyCursor(my_id, coords2.x, coords2.y);
        let json = JSON.stringify(message);
        websocket.send(json);
    } else {
        updateCursorCoords(my_id, event.clientX, event.clientY);
    }
}, { passive: true });

connectWS();