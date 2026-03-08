
from typing import Dict, Optional
from pydantic import BaseModel

from servidor.dominio.maestros.cliente_dto import ClienteDTO
from servidor.dominio.maestros.estado_pedido_dto import EstadoPedidoDTO
from servidor.dominio.maestros.estado_fabricacion_semanal_dto import EstadoFabricacionSemanalDTO
from servidor.dominio.maestros.estado_bota_dto import EstadoBotaDTO
from servidor.dominio.maestros.estado_trazabilidad_fabricacion_dto import EstadoTrazabilidadFabricacionDTO
from servidor.dominio.maestros.estado_palet_dto import EstadoPaletDTO
from servidor.dominio.maestros.instalacion_dto import InstalacionDTO
from servidor.dominio.maestros.puesto_trabajo_dto import PuestoTrabajoDTO
from servidor.dominio.maestros.ubicacion_dto import UbicacionDTO
from servidor.dominio.maestros.proveedor_dto import ProveedorDTO
from servidor.dominio.maestros.usuario_dto import UsuarioDTO
from servidor.dominio.maestros.rol_dto import RolDTO
from servidor.dominio.maestros.material_dto import MaterialDTO
from servidor.dominio.maestros.duela_dto import DuelaDTO
from servidor.dominio.maestros.entrada_dto import EntradaDTO
from servidor.dominio.maestros.linea_entrada_dto import LineaEntradaDTO
from servidor.dominio.maestros.palet_dto import PaletDTO
from servidor.dominio.maestros.producto_dto import ProductoDTO
from servidor.dominio.maestros.archivo_subido_dto import ArchivoSubidoDTO
from servidor.dominio.maestros.ambiente_dto import AmbienteDTO
from servidor.dominio.maestros.entrada_fleje_dto import EntradaFlejeDTO


class MaestrosDTO(BaseModel):
    clientes: Optional[Dict[int, "ClienteDTO"]] = {}
    estados_pedidos: Optional[Dict[int, "EstadoPedidoDTO"]] = {}
    estados_fabricacion_semanal: Optional[Dict[int, "EstadoFabricacionSemanalDTO"]] = {}
    estados_botas: Optional[Dict[int, "EstadoBotaDTO"]] = {}
    estados_trazabilidad_fabricacion: Optional[Dict[int, "EstadoTrazabilidadFabricacionDTO"]] = {}
    estados_palets: Optional[Dict[int, "EstadoPaletDTO"]] = {}
    instalaciones: Optional[Dict[int, InstalacionDTO]] = {}
    ubicaciones: Optional[Dict[int, UbicacionDTO]] = {}
    proveedores: Optional[Dict[int, ProveedorDTO]] = {}
    usuarios: Optional[Dict[int, "UsuarioDTO"]] = {}
    roles: Optional[Dict[int, "RolDTO"]] = {}
    puestos_trabajo: Optional[Dict[int, "PuestoTrabajoDTO"]] = {}
    materiales: Optional[Dict[int, "MaterialDTO"]] = {}
    duelas: Optional[Dict[int, "DuelaDTO"]] = {}
    entradas: Optional[Dict[int, "EntradaDTO"]] = {}
    lineas_entrada: Optional[Dict[int, "LineaEntradaDTO"]] = {}
    palets: Optional[Dict[int, "PaletDTO"]] = {}
    productos: Optional[Dict[int, "ProductoDTO"]] = {}
    archivos_subidos: Optional[Dict[int, "ArchivoSubidoDTO"]] = {}
    ambientes: Optional[Dict[int, "AmbienteDTO"]] = {}
    entradas_flejes: Optional[Dict[int, "EntradaFlejeDTO"]] = {}

    def buscar_usuario_por_username(self, username: str) -> UsuarioDTO | None:
        buscado = (username or "").strip().lower()
        for usuario in (self.usuarios.values() if self.usuarios else []):
            if (usuario.alias or "").strip().lower() == buscado:
                return usuario
        return None

    def obtener_rol_id_por_defecto(self) -> int:
        if not self.roles:
            return 0
        for rol in self.roles.values():
            if rol.nombre == "operario":
                return rol.id
        return 0
