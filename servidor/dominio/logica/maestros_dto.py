
from typing import Dict, Optional
from pydantic import BaseModel

from servidor.dominio.maestros.cliente_dto import ClienteDTO
from servidor.dominio.maestros.estado_dto import EstadoDTO
from servidor.dominio.maestros.instalacion_dto import InstalacionDTO
from servidor.dominio.maestros.puesto_trabajo_dto import PuestoTrabajoDTO
from servidor.dominio.maestros.ubicacion_dto import UbicacionDTO
from servidor.dominio.maestros.proveedor_dto import ProveedorDTO
from servidor.dominio.maestros.usuario_dto import UsuarioDTO
from servidor.dominio.maestros.rol_dto import RolDTO
from servidor.dominio.maestros.material_dto import MaterialDTO
from servidor.dominio.maestros.duela_dto import DuelaDTO
from servidor.dominio.maestros.pedido_dto import PedidoDTO
from servidor.dominio.maestros.linea_pedido_dto import LineaPedidoDTO
from servidor.dominio.maestros.palet_dto import PaletDTO
from servidor.dominio.maestros.producto_dto import ProductoDTO


class MaestrosDTO(BaseModel):
    clientes: Optional[Dict[int, "ClienteDTO"]] = {}
    estados: Optional[Dict[int, "EstadoDTO"]] = {}
    instalaciones: Optional[Dict[int, InstalacionDTO]] = {}
    ubicaciones: Optional[Dict[int, UbicacionDTO]] = {}
    proveedores: Optional[Dict[int, ProveedorDTO]] = {}
    usuarios: Optional[Dict[int, "UsuarioDTO"]] = {}
    roles: Optional[Dict[int, "RolDTO"]] = {}
    puestos_trabajo: Optional[Dict[int, "PuestoTrabajoDTO"]] = {}
    materiales: Optional[Dict[int, "MaterialDTO"]] = {}
    duelas: Optional[Dict[int, "DuelaDTO"]] = {}
    pedidos: Optional[Dict[int, "PedidoDTO"]] = {}
    lineas_pedido: Optional[Dict[int, "LineaPedidoDTO"]] = {}
    palets: Optional[Dict[int, "PaletDTO"]] = {}
    productos: Optional[Dict[int, "ProductoDTO"]] = {}

    def buscar_usuario_por_username(self, username: str) -> UsuarioDTO | None:
        for usuario in (self.usuarios.values() if self.usuarios else []):
            if usuario.username == username:
                return usuario
        return None
