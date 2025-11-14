from typing import Dict, List, Optional
from pydantic import BaseModel

from servidor.dominio.maestros.cliente_dto import ClienteDTO
from servidor.dominio.maestros.estado_dto import EstadoDTO
from servidor.dominio.maestros.instalacion_dto import InstalacionDTO
from servidor.dominio.maestros.ubicacion_dto import UbicacionDTO
from servidor.dominio.maestros.proveedor_dto import ProveedorDTO
from servidor.dominio.maestros.usuario_dto import UsuarioDTO
from servidor.dominio.maestros.rol_dto import RolDTO


class MaestrosDTO(BaseModel):
    clientes: Optional[Dict[int, "ClienteDTO"]] = {}
    estados: Optional[Dict[int, "EstadoDTO"]] = {}
    instalaciones: Optional[Dict[int, InstalacionDTO]] = {}
    ubicaciones: Optional[Dict[int, UbicacionDTO]] = {}
    proveedores: Optional[Dict[int, ProveedorDTO]] = {}
    usuarios: Optional[Dict[int, "UsuarioDTO"]] = {}
    roles: Optional[Dict[int, "RolDTO"]] = {}

    def buscar_usuario_por_username(self, username: str) -> UsuarioDTO | None:
        for usuario in (self.usuarios.values() if self.usuarios else []):
            if usuario.username == username:
                return usuario
        return None
