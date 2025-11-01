# app/routes/crud_routes.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse

from ..dominio.InMemoryService import InMemoryService

class CrudRoutes:

    @staticmethod
    def get_router():
        router = APIRouter(tags=["CRUD"])

        svc = InMemoryService()
        clients = set()

        # =======================
        # CRUD Endpoints
        # =======================
        @router.get("/items")
        async def list_items():
            return await svc.list()


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
            try:
                items = await svc.list()
                await ws.send_json({"type": "init", "items": items})

                while True:
                    msg = await ws.receive_text()
                    if msg == "ping":
                        await ws.send_json({"type": "pong"})
                    else:
                        await ws.send_json({"type": "echo", "msg": msg})
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

        return router