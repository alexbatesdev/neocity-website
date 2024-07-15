// This code has been grabbed from nekoweb.org
// This code is going entirely unused and unmodified
// This code is here for the sake of reference
// I aim to implement this feature on my personal website but in my own way


let stopCursors = innerWidth < 1215;
window.addEventListener('resize', () => {
    stopCursors = innerWidth < 1215;
});

const cursorsDiv = document.getElementById('cursors');
const selfCursor = document.getElementById('selfcursor');

let ws;
let cursors = {};
let rects = cursorsDiv.getBoundingClientRect();
let rectLeft = rects.left;
let rectTop = rects.top;
let currentId = null;
let update = true;
let error;

let showcursors = !document.cookie.includes("showcursors=false");

document.addEventListener("visibilitychange", (event) => {
    update = document.visibilityState == "visible";
});

function createCursor(id, x, y, h, username) {
    if(cursors[id]) {
        cursors[id].x = x;
        cursors[id].y = y;
        cursors[id].h = h;
        cursors[id].username = username;
        cursors[id].lastMove = 0;
        if(x === 0 && y === 0) cursors[id].cursor.hidden = true;
        else cursors[id].cursor.hidden = false;
        return cursors[id];
    }
    let div = document.createElement('span');
    div.className = 'cursor';
    div.id = `cursor-${id}`;
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.hidden = true;

    let nick = document.createElement('span');
    nick.className = 'nick';
    nick.textContent = username;
    nick.hidden = true;

    let message = document.createElement('span');
    message.className = 'message';
    message.textContent = 'Click to visit';
    message.hidden = true;

    let arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '\\/';
    arrow.hidden = true;
    
    let cursor = document.createElement('img');
    cursor.src = `${location.protocol}//${username}.${location.host}/cursor.png?original=1`;
    cursor.onerror = () => {
        if(cursor.src !== '/assets/cursor.png') cursor.src = '/assets/cursor.png';
    };
    
    div.append(cursor);
    div.append(nick);
    div.append(arrow);
    div.append(message);
    cursorsDiv.append(div);
    return { id, cursor: div, x, y, h, username, lastMove: 0 };
}

function updateCursor(data) {
    if(!update) return;

    data = new Int32Array(data);
    let id = data[0];
    let x = data[1];
    let y = data[2];
    let h = data[3];
    x = Math.min(x, innerWidth - rectLeft - 50);
    y = Math.min(y, window.document.body.clientHeight - 100);

    if (id === currentId) return;
    let c = cursors[id];
    if (!c) {
        cursors[id] = createCursor(id, x, y, h);
    }
    c.x = x;
    c.y = y;
    c.h = h;
    c.lastMove = Date.now();
    let ratio = document.body.clientHeight / h;
    c.cursor.style.left = x + "px";
    c.cursor.style.top = y * ratio + "px";
    if (x === 0 && y === 0 && !c.cursor.hidden) c.cursor.hidden = true;
    else if (c.cursor.hidden) c.cursor.hidden = false;
}

function connectWs() {
    ws = new WebSocket(`${location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.host}${window.location.pathname}${window.location.search}`);
    ws.binaryType = "arraybuffer";
    error = false;

    ws.onopen = function open() {
        console.log('connected');
    };

    ws.onmessage = function incoming(msg) {
        if (typeof (msg.data) !== "string" && showcursors) {
            updateCursor(msg.data);
            return;
        }
        try {
            let data = JSON.parse(msg.data);
            if (data.type === "id") {
                currentId = data.id;
            } else if (data.type === "leave") {
                let cursor = cursors[data.id];
                if (cursor) {
                    cursor.cursor.remove();
                    delete cursors[data.id];
                }
            } else if (data.type === "cursors" && showcursors) {
                for (let cursor of data.cursors) {
                    cursors[cursor.id] = createCursor(cursor.id, cursor.x, cursor.y, cursor.h, cursor.username);
                }
            } else if (data.type === "join" && showcursors) {
                cursors[data.cursor.id] = createCursor(data.cursor.id, data.cursor.x, data.cursor.y, data.cursor.h, data.cursor.username);
            } else if (data.type === "message") {
                let cursor = cursors[data.id];
                if (cursor) {
                    let message = cursor.cursor.querySelector('.message');
                    let arrow = cursor.cursor.querySelector('.arrow');
                    message.textContent = data.message;
                    message.hidden = false;
                    arrow.hidden = false;
                    clearTimeout(cursor.to);
                    cursor.to = setTimeout(() => {
                        message.hidden = true;
                        arrow.hidden = true;
                    }, 10000);
                }
            } else if(data.type === "error") {
                error = data.message;
            }
        } catch (e) {
            console.log(e);
        }
    };

    ws.onclose = function close() {
        error = "Connection closed.";
        setTimeout(connectWs, 1000);
    };
}

let pathname = window.location.pathname;
if(pathname.endsWith('/')) pathname = pathname.slice(0, -1);
if(![
    '/follows',
    '/followers',
    '/settings',
    '/account',
    '/dashboard',
    '/dashboard/editor',
    '/ftp',
    '/git',
    '/changeemailconfirm',
    '/resendverification',
    '/resetpassword',
    '/forgotpassword',
    '/verifyemail',
    '/register',
    '/faq'
].includes(pathname)) {
    connectWs();

    let chatinput = document.getElementById('chatinput');
    if(chatinput) {
        window.addEventListener('keydown', e => {
            if(document.activeElement.tagName === 'INPUT') return;
            
            if(e.key === 'Enter') {
                document.getElementById('chatdiv').hidden = false;
                chatinput.focus();
            } else if(e.key === 'Escape') {
                document.getElementById('chatdiv').hidden = true;
            }
        });
        chatinput.addEventListener('blur', e => {
            document.getElementById('chatdiv').hidden = true;
        });
        let to;
        chatinput.addEventListener('keydown', e => {
            if(e.key === 'Enter') {
                if(error) {
                    return alert(`Error: ${error}`);
                }
                e.preventDefault();
                if(ws.readyState === WebSocket.OPEN && !stopCursors) {
                    let message = chatinput.value;
                    chatinput.value = '';
                    document.getElementById('chatdiv').hidden = true;
                    ws.send(JSON.stringify({ type: 'message', message }));
                    let selfmessage = document.getElementById('selfmessage');
                    selfmessage.textContent = message;
                    selfmessage.hidden = false;
                    document.getElementById('selfarrow').hidden = false;
                    clearTimeout(to);
                    to = setTimeout(() => {
                        selfmessage.hidden = true;
                        document.getElementById('selfarrow').hidden = true;
                    }, 10000);
                }
            }
        });
    }
}

let lastSend = 0;
if (showcursors) {
    document.addEventListener('mousemove', e => {
        if(!ws) return;
        if(stopCursors) return;

        let x = e.pageX - rectLeft;
        let y = e.pageY - 4;
        if (Date.now() - lastSend > 30 && ws.readyState === WebSocket.OPEN) {
            selfCursor.style.left = e.pageX + "px";
            selfCursor.style.top = e.pageY + "px";

            lastSend = Date.now();
            let ab = new Int16Array(3);
            ab[0] = x;
            ab[1] = y;
            ab[2] = document.body.clientHeight;
            if(!error) ws.send(ab);
        }

        for(let id in cursors) {
            let cursor = cursors[id];
            let ratio = document.body.clientHeight / cursor.h;
            let distance = Math.sqrt((cursor.x - x) ** 2 + ((cursor.y * ratio) - y + 4) ** 2);
            let nick = cursor.cursor.querySelector('.nick');
            if (distance < 25) {
                if(nick.hidden) nick.hidden = false;
            } else {
                if(!nick.hidden) nick.hidden = true;
            }
        }
    }, { passive: true });

    document.addEventListener('mousedown', e => {
        if(e.button === 1) {

            let x = e.pageX - rectLeft;
            let y = e.pageY - 4;

            for(let id in cursors) {
                let cursor = cursors[id];
                let ratio = document.body.clientHeight / cursor.h;
                let distance = Math.sqrt((cursor.x - x) ** 2 + ((cursor.y * ratio) - y + 4) ** 2);
                if (distance < 25) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`https://${cursor.username}.nekoweb.org`);
                }
            }
        }
    });
}

setInterval(() => {
    for(let id in cursors) {
        let c = cursors[id];
        if(Date.now() - c.lastMove > 60000) {
            if(!c.cursor.hidden) c.cursor.hidden = true;
        } else {
            if(c.cursor.hidden) c.cursor.hidden = false;
        }
    }
}, 5000);