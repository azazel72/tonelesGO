# app/routes/crud_routes.py
import logging
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from servidor.colector import Colector
from servidor.logica.acciones import obtener_acciones
from servidor.conexiones.request_message import RequestMessage
from servidor.conexiones.response_message import ResponseMessage

logger = logging.getLogger("paezlobato_crud_routes")

class CrudRoutes:

    @staticmethod
    def get_router():
        router = APIRouter(tags=["CRUD"])

        svc = {}
        clients = set()
        ACCIONES = obtener_acciones()

        # =======================
        # CRUD Endpoints
        # =======================
        @router.get("/items")
        async def list_items():
            await broadcast({"type": "list_request"})
            return len(clients)


        @router.post("/items")
        async def create_item(item: dict):
            created = await svc.create(item)
            await broadcast({"type": "created", "item": created})
            return JSONResponse(content=created, status_code=201)


        @router.patch("/items/{item_id}")
        async def patch_item(item_id: int, patch: dict):
            try:
                updated = await svc.update_partial(item_id, patch)
                await broadcast({"type": "updated", "item": updated})
                return updated
            except KeyError:
                raise HTTPException(status_code=404, detail="Item not found")


        @router.delete("/items/{item_id}")
        async def delete_item(item_id: int):
            try:
                await svc.delete(item_id)
                await broadcast({"type": "deleted", "id": item_id})
                return {"ok": True}
            except KeyError:
                raise HTTPException(status_code=404, detail="Item not found")


        # =======================
        # WebSocket
        # =======================
        @router.websocket("/ws")
        async def websocket_endpoint(ws: WebSocket):
            await ws.accept()

            clients.add(ws)
            await ws.send_json(ResponseMessage.ok("login", Colector.colector.maestros.usuarios.get(1)).model_dump())

            try:
                while True:
                    raw = await ws.receive_text()
                    print(raw)
                    try:
                        msg = ResponseMessage[Any].model_validate_json(raw)
                    except ValidationError as e:
                        await ws.send_json(ResponseMessage.fail("error", "invalid_payload").model_dump())
                        continue

                    await accion_recibida(ws, msg)

            except WebSocketDisconnect:
                clients.discard(ws)

        # =======================
        # Broadcast común
        # =======================
        async def broadcast(message: dict):
            if not clients:
                return
            to_remove = []
            for ws in clients:
                try:
                    await ws.send_json(message)
                except Exception:
                    to_remove.append(ws)
            for ws in to_remove:
                clients.discard(ws)


        async def accion_recibida(ws: WebSocket, msg: "RequestMessage"):
            # Procesa el mensaje recibido vía WebSocket
            logger.info("Acción recibida: %s", msg.action)
            try:
                handler = ACCIONES.get(msg.action)
                if handler:
                    result = handler(ws, msg)
                    if result is not None:
                        await ws.send_json(ResponseMessage.ok(msg.action, result).model_dump())
                    else:
                        await ws.send_json(ResponseMessage.fail(msg.action, "no_result").model_dump())
                else:
                    await ws.send_json(ResponseMessage.fail("unknown_action", msg.action).model_dump())
            except Exception as e:
                logger.error("Error al procesar la acción %s: %s", msg.action, str(e))
                await ws.send_json(ResponseMessage.fail(msg.action, str(e)).model_dump())
        
        return router


class ConexionWS:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket