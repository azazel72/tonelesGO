
from typing import Dict, Optional
from pydantic import BaseModel

from servidor.dominio.fabricacion.pedido_dto import PedidoDTO
from servidor.dominio.fabricacion.tipo_producto_dto import TipoProductoDTO
from servidor.dominio.fabricacion.fabricacion_semanal_dto import FabricacionSemanalDTO
from servidor.dominio.fabricacion.trazabilidad_procesado_dto import TrazabilidadProcesadoDTO
from servidor.dominio.fabricacion.trazabilidad_fabricacion_dto import TrazabilidadFabricacionDTO
from servidor.dominio.fabricacion.trazabilidad_producto_dto import TrazabilidadProductoDTO
from servidor.dominio.fabricacion.consumo_dto import ConsumoDTO


class FabricacionDTO(BaseModel):
    pedidos: Optional[Dict[int, PedidoDTO]] = {}
    tipos_producto: Optional[Dict[int, TipoProductoDTO]] = {}
    fabricacion_semanal: Optional[Dict[int, FabricacionSemanalDTO]] = {}
    trazabilidad_procesado: Optional[Dict[int, TrazabilidadProcesadoDTO]] = {}
    trazabilidad_fabricacion: Optional[Dict[int, TrazabilidadFabricacionDTO]] = {}
    trazabilidad_producto: Optional[Dict[int, TrazabilidadProductoDTO]] = {}
    consumos: Optional[Dict[int, ConsumoDTO]] = {}
