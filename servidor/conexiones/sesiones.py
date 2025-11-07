from fastapi import WebSocket
from datetime import datetime, timedelta, timezone
import secrets

from servidor.dominio.maestros.usuario_dto import UsuarioDTO


class Sesiones:

    sesiones = {}

    def iniciar_sesion(self, sesion_id: str) -> 'Sesion':
        if sesion_id in self.sesiones:
            return self.sesiones[sesion_id]
        sesion = Sesion(sesion_id)
        self.sesiones[sesion_id] = sesion
        return sesion
    
    def generar_sesion_id(self) -> str:
        return secrets.token_hex(32)


class Sesion:

    sesion_id: str
    ws: WebSocket = None
    fecha_inicio: str = None
    fecha_expiracion: str = None
    usuario: UsuarioDTO = None

    def __init__(self, sesion_id: str):
        self.sesion_id = sesion_id
