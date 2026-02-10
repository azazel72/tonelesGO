from typing import Any
from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder

from servidor.conexiones.response_message import ResponseMessage


_clients: set[WebSocket] = set()
_client_state: dict[WebSocket, dict[str, Any]] = {}


def set_registry(clients: set[WebSocket], client_state: dict[WebSocket, dict[str, Any]]):
    global _clients, _client_state
    _clients = clients
    _client_state = client_state


async def broadcast_error(
    message: str,
    scope: str = "all",
    pantalla: str | None = None,
    contexto: dict | None = None,
    target_ws: WebSocket | None = None,
):
    if not _clients:
        return
    to_remove = []
    for ws in _clients:
        if scope == "cliente" and target_ws is not None and ws is not target_ws:
            continue
        if scope == "pantalla":
            estado = _client_state.get(ws, {})
            if pantalla and estado.get("pantalla") != pantalla:
                continue
            if contexto:
                ctx = estado.get("contexto") or {}
                if any(ctx.get(k) != v for k, v in contexto.items()):
                    continue
        try:
            rm = ResponseMessage.fail("async_error", message).model_dump()
            safe_data = jsonable_encoder(rm)
            await ws.send_json(safe_data)
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        _clients.discard(ws)
        _client_state.pop(ws, None)


async def broadcast_event(
    action: str,
    data: Any,
    scope: str = "all",
    pantalla: str | None = None,
    contexto: dict | None = None,
    target_ws: WebSocket | None = None,
):
    if not _clients:
        return
    to_remove = []
    for ws in _clients:
        if scope == "cliente" and target_ws is not None and ws is not target_ws:
            continue
        if scope == "pantalla":
            estado = _client_state.get(ws, {})
            if pantalla and estado.get("pantalla") != pantalla:
                continue
            if contexto:
                ctx = estado.get("contexto") or {}
                if any(ctx.get(k) != v for k, v in contexto.items()):
                    continue
        try:
            rm = ResponseMessage.ok(action, data).model_dump()
            safe_data = jsonable_encoder(rm)
            await ws.send_json(safe_data)
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        _clients.discard(ws)
        _client_state.pop(ws, None)
