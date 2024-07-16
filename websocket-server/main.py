from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from enum import Enum
import asyncio
import json
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Server started", flush=True)
    asyncio.create_task(broadcast_positions())
    yield
    print("Server stopped")

app = FastAPI(lifespan=lifespan)

class Action(str, Enum):
    CONNECT = "connect"
    DISCONNECT = "disconnect"
    MESSAGE = "message"
    POSITIONS = "positions"
    MOVE = "move"

class Coords(BaseModel):
    x: float
    y: float



class WebSocketMessage(BaseModel):
    action: Action
    coords: Coords | None
    message: str | None
    user_id: str

connected_clients = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    print(f"Client {user_id} connected", flush=True)
    await websocket.accept()
    connected_clients[user_id] = {"websocket": websocket, "coords": Coords(x=0, y=0)}
    print(connected_clients, flush=True)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Client {user_id} sent: {data}", flush=True)
            message = WebSocketMessage.model_validate_json(data)
            
            if message.action == Action.MOVE:
                connected_clients[user_id]["coords"] = Coords(x=message.coords.x, y=message.coords.y)
                print(f"Client {user_id} moved to {message.coords.x}, {message.coords.y}", flush=True)
            elif message.action == Action.MESSAGE:
                await broadcast_message(message)
            
    except WebSocketDisconnect:
        print(f"Client {user_id} disconnected", flush=True)
        del connected_clients[user_id]
        await websocket.close()

async def broadcast_positions():
    while True:
        try:
            if connected_clients:
                print("Broadcasting positions", flush=True)
                positions = {}
                print(connected_clients, flush=True)
                for user_id, client in connected_clients.items():
                    print(f"Getting coords for {user_id}", flush=True)
                    print(client, flush=True)
                    print(Coords(x=client["coords"].x, y=client["coords"].y).model_dump_json(), flush=True)
                    positions[user_id] = client["coords"].model_dump()
                print(positions, flush=True)
                message = WebSocketMessage(
                    action=Action.POSITIONS, 
                    coords=None, 
                    message=json.dumps(positions), 
                    user_id="server"
                )
                
                disconnected_clients = []
                for user_id, client in connected_clients.items():
                    try:
                        await client["websocket"].send_text(message.model_dump_json())
                    except Exception as e:
                        print(f"Error sending to {user_id}: {e}", flush=True)
                        disconnected_clients.append(user_id)

                for user_id in disconnected_clients:
                    del connected_clients[user_id]
        except Exception as e:
            print(f"Unexpected error in broadcast_positions: {e}", flush=True)

        await asyncio.sleep(0.03)

async def broadcast_message(message: WebSocketMessage):
    print(message.message, flush=True)
    disconnected_clients = []
    for user_id, client in connected_clients.items():
        try:
            await client["websocket"].send_text(message.model_dump_json())
        except Exception as e:
            print(f"Error sending to {user_id}: {e}", flush=True)
            disconnected_clients.append(user_id)
    for user_id in disconnected_clients:
        del connected_clients[user_id]


@app.get("/cursors")
async def get_cursors():
    return {user_id: client["coords"] for user_id, client in connected_clients.items()}