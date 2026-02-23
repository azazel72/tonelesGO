
from servidor.colector import Colector
from servidor.dominio.maestros.usuario_dto import UsuarioDTO
from servidor.conexiones.request_message import RequestMessage
from servidor.herramientas import BcryptHelper

def iniciar_sesion(ws, request:RequestMessage) -> UsuarioDTO | None:
    print(request)
    username = request.data.get("user")
    password = request.data.get("pass")
    return __iniciar_sesion(username, password)

def __iniciar_sesion(username: str, password: str) -> UsuarioDTO | None:
    usuario : UsuarioDTO | None = Colector.colector.maestros.buscar_usuario_por_username(username)
    if usuario and __verificar_contraseña(password, usuario.clave):
        return usuario
    return None

def __verificar_contraseña(password: str, password_hash: str) -> bool:
    return BcryptHelper.verify_password(password or "", password_hash or "")

def cerrar_sesion(ws, request) -> bool:
    # Lógica para cerrar sesión (si es necesario)
    return True
