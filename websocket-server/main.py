from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from enum import Enum
import asyncio
import json
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan():
    asyncio.create_task(broadcast_positions())
    yield
    print("Server stopped")

app = FastAPI()

class Action(str, Enum):
    CONNECT = "connect"
    DISCONNECT = "disconnect"
    MESSAGE = "message"
    POSITIONS = "positions"
    MOVE = "move"

class Coords(BaseModel):
    x: int
    y: int

class WebSocketMessage(BaseModel):
    action: Action
    coordinates: Coords = None
    message: str = None
    user_id: str

connected_clients = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connected_clients[user_id] = {"websocket": websocket, "coords": Coords(x=0, y=0)}

    try:
        while True:
            data = await websocket.receive_text()
            message = WebSocketMessage.parse_raw(data)
            
            if message.action == Action.POSITIONS:
                connected_clients[user_id]["coords"] = message.coordinates
            elif message.action == Action.MESSAGE:
                await broadcast_message(message)
            
    except WebSocketDisconnect:
        del connected_clients[user_id]
        await websocket.close()

async def broadcast_positions():
    while True:
        if connected_clients:
            positions = {user_id: client["coords"] for user_id, client in connected_clients.items()}
            message = WebSocketMessage(action=Action.POSITIONS, coordinates=None, message=json.dumps(positions), user_id="server")
            await asyncio.gather(*[client["websocket"].send_text(message.json()) for client in connected_clients.values()])
        await asyncio.sleep(1)

async def broadcast_message(message: WebSocketMessage):
    await asyncio.gather(*[client["websocket"].send_text(message.json()) for client in connected_clients.values()])
