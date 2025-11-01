from typing import Dict, List, Optional
from pydantic import BaseModel

from servidor.dominio.maestros.cliente_dto import ClienteDTO
from servidor.dominio.maestros.estado_dto import EstadoDTO
from servidor.dominio.maestros.instalacion_dto import InstalacionDTO
from servidor.dominio.maestros.ubicacion_dto import UbicacionDTO
from servidor.dominio.maestros.proveedor_dto import ProveedorDTO

class MaestrosDTO(BaseModel):
    clientes: Optional[Dict[int, "ClienteDTO"]] = {}
    estados: Optional[Dict[int, "EstadoDTO"]] = {}
    instalaciones: Optional[Dict[int, InstalacionDTO]] = {}
    ubicaciones: Optional[Dict[int, UbicacionDTO]] = {}
    proveedores: Optional[Dict[int, ProveedorDTO]] = {}
