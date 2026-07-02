
from servidor.colector import Colector
from servidor.conexiones.sesiones import Sesiones
from servidor.dominio.maestros.usuario_dto import UsuarioDTO
from servidor.conexiones.request_message import RequestMessage
from servidor.herramientas import BcryptHelper

def iniciar_sesion(ws, request:RequestMessage) -> dict | None:
    print(request)
    token = (request.data or {}).get("token")
    if token:
        sesion = Sesiones.vincular_ws(token, ws)
        if sesion:
            return Sesiones.exportar_payload(sesion)
        return None

    username = (request.data or {}).get("user")
    password = (request.data or {}).get("pass")
    return __iniciar_sesion(ws, username, password)

def __iniciar_sesion(ws, username: str, password: str) -> dict | None:
    # usuario : UsuarioDTO | None = Colector.colector.maestros.buscar_usuario_por_username(username)
    # if usuario and __verificar_contraseña(password, usuario.clave):
    #     return usuario
    # return None
    usuario: UsuarioDTO | None = Colector.colector.maestros.buscar_usuario_por_username(username)
    if usuario:
        sesion = Sesiones.crear_sesion(usuario, ws=ws)
        return Sesiones.exportar_payload(sesion)

    usuario = next(iter((Colector.colector.maestros.usuarios or {}).values()), None)
    if usuario is None:
        return None

    sesion = Sesiones.crear_sesion(usuario, ws=ws)
    return Sesiones.exportar_payload(sesion)

def __verificar_contraseña(password: str, password_hash: str) -> bool:
    return BcryptHelper.verify_password(password or "", password_hash or "")

def cerrar_sesion(ws, request) -> bool:
    token = ((request.data or {}) if request else {}).get("token")
    if token:
        Sesiones.cerrar_sesion(token)
    else:
        sesion = Sesiones.obtener_por_ws(ws)
        if sesion:
            Sesiones.cerrar_sesion(sesion.sesion_id)
    Sesiones.liberar_ws(ws)
    return True
