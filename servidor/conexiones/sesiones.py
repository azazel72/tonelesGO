from fastapi import WebSocket
from datetime import datetime, timedelta, timezone
import secrets

from servidor.colector import Colector
from servidor.dominio.maestros.usuario_dto import UsuarioDTO


class Sesiones:
    sesiones: dict[str, "Sesion"] = {}
    sesiones_por_ws: dict[WebSocket, str] = {}

    @classmethod
    def generar_sesion_id(cls) -> str:
        return secrets.token_hex(32)

    @classmethod
    def crear_sesion(cls, usuario: UsuarioDTO, ws: WebSocket | None = None, duracion_horas: int = 12) -> "Sesion":
        sesion_id = cls.generar_sesion_id()
        ahora = datetime.now(timezone.utc)
        sesion = Sesion(
            sesion_id=sesion_id,
            ws=ws,
            fecha_inicio=ahora,
            fecha_expiracion=ahora + timedelta(hours=duracion_horas),
            usuario=usuario,
        )
        cls.sesiones[sesion_id] = sesion
        if ws is not None:
            cls.sesiones_por_ws[ws] = sesion_id
        return sesion

    @classmethod
    def obtener_sesion(cls, sesion_id: str | None) -> "Sesion | None":
        if not sesion_id:
            return None
        sesion = cls.sesiones.get(sesion_id)
        if sesion is None:
            return None
        if sesion.expirada:
            cls.cerrar_sesion(sesion_id)
            return None
        return sesion

    @classmethod
    def vincular_ws(cls, sesion_id: str, ws: WebSocket) -> "Sesion | None":
        sesion = cls.obtener_sesion(sesion_id)
        if sesion is None:
            return None
        if sesion.ws is not None:
            cls.sesiones_por_ws.pop(sesion.ws, None)
        sesion.ws = ws
        cls.sesiones_por_ws[ws] = sesion_id
        return sesion

    @classmethod
    def obtener_por_ws(cls, ws: WebSocket) -> "Sesion | None":
        sesion_id = cls.sesiones_por_ws.get(ws)
        return cls.obtener_sesion(sesion_id)

    @classmethod
    def liberar_ws(cls, ws: WebSocket) -> None:
        sesion_id = cls.sesiones_por_ws.pop(ws, None)
        if not sesion_id:
            return
        sesion = cls.sesiones.get(sesion_id)
        if sesion and sesion.ws is ws:
            sesion.ws = None

    @classmethod
    def cerrar_sesion(cls, sesion_id: str) -> None:
        sesion = cls.sesiones.pop(sesion_id, None)
        if sesion and sesion.ws is not None:
            cls.sesiones_por_ws.pop(sesion.ws, None)

    @classmethod
    def exportar_payload(cls, sesion: "Sesion") -> dict:
        payload = sesion.usuario.model_dump()
        payload["access_token"] = sesion.sesion_id
        payload["token"] = sesion.sesion_id
        payload["token_expires_at"] = sesion.fecha_expiracion.isoformat() if sesion.fecha_expiracion else None
        payload["aliases"] = cls.obtener_aliases_usuarios()
        return payload

    @classmethod
    def obtener_aliases_usuarios(cls) -> list[str]:
        usuarios = (Colector.colector.maestros.usuarios or {}) if Colector.colector and Colector.colector.maestros else {}
        alias_unicos: set[str] = set()

        for usuario in usuarios.values():
            alias = (getattr(usuario, "alias", "") or "").strip()
            if alias:
                alias_unicos.add(alias)

        return sorted(alias_unicos, key=str.casefold)


class Sesion:
    sesion_id: str
    ws: WebSocket | None = None
    fecha_inicio: datetime | None = None
    fecha_expiracion: datetime | None = None
    usuario: UsuarioDTO | None = None

    def __init__(
        self,
        sesion_id: str,
        ws: WebSocket | None = None,
        fecha_inicio: datetime | None = None,
        fecha_expiracion: datetime | None = None,
        usuario: UsuarioDTO | None = None,
    ):
        self.sesion_id = sesion_id
        self.ws = ws
        self.fecha_inicio = fecha_inicio
        self.fecha_expiracion = fecha_expiracion
        self.usuario = usuario

    @property
    def expirada(self) -> bool:
        if self.fecha_expiracion is None:
            return False
        return datetime.now(timezone.utc) >= self.fecha_expiracion
