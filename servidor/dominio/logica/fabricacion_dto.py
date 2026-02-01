
from typing import Dict, Optional
from pydantic import BaseModel

from servidor.dominio.fabricacion.orden_fabricacion_dto import OrdenFabricacionDTO
from servidor.dominio.fabricacion.tipo_producto_dto import TipoProductoDTO
from servidor.dominio.fabricacion.linea_fabricacion_dto import LineaFabricacionDTO
from servidor.dominio.fabricacion.trazabilidad_procesado_dto import TrazabilidadProcesadoDTO
from servidor.dominio.fabricacion.trazabilidad_fabricacion_dto import TrazabilidadFabricacionDTO
from servidor.dominio.fabricacion.trazabilidad_producto_dto import TrazabilidadProductoDTO
from servidor.dominio.fabricacion.bota_dto import BotaDTO


class FabricacionDTO(BaseModel):
    ordenes_fabricacion: Optional[Dict[int, OrdenFabricacionDTO]] = {}
    tipos_producto: Optional[Dict[int, TipoProductoDTO]] = {}
    lineas_fabricacion: Optional[Dict[int, LineaFabricacionDTO]] = {}
    trazabilidad_procesado: Optional[Dict[int, TrazabilidadProcesadoDTO]] = {}
    trazabilidad_fabricacion: Optional[Dict[int, TrazabilidadFabricacionDTO]] = {}
    trazabilidad_producto: Optional[Dict[int, TrazabilidadProductoDTO]] = {}
    botas: Optional[Dict[int, BotaDTO]] = {}
