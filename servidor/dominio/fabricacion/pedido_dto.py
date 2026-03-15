
from datetime import date
from pydantic import BaseModel
from servidor.modelos import PedidoDB


class PedidoDTO(BaseModel):
    id: int | None
    numero: str = ""
    cliente_id: int | None = None
    tipo_producto_id: int | None = None
    material_id: int | None = None
    cantidad: int = 0
    cantidad_fabricada: int = 0
    fecha: date | None = None
    descripcion: str = ""
    fecha_finalizacion: date | None = None
    estado: int | None = None

    def from_db(orden_db: PedidoDB) -> "PedidoDTO":
        return PedidoDTO(
            id=orden_db.id,
            numero=orden_db.numero,
            cliente_id=orden_db.cliente_id,
            tipo_producto_id=orden_db.tipo_producto_id,
            material_id=orden_db.material_id,
            cantidad=orden_db.cantidad,
            cantidad_fabricada=orden_db.cantidad_fabricada,
            fecha=orden_db.fecha,
            descripcion=orden_db.descripcion,
            fecha_finalizacion=orden_db.fecha_finalizacion,
            estado=orden_db.estado,
        )

    def to_db(self) -> PedidoDB:
        return PedidoDB(
            id=self.id,
            numero=self.numero,
            cliente_id=self.cliente_id,
            tipo_producto_id=self.tipo_producto_id,
            material_id=self.material_id,
            cantidad=self.cantidad,
            cantidad_fabricada=self.cantidad_fabricada,
            fecha=self.fecha,
            descripcion=self.descripcion,
            fecha_finalizacion=self.fecha_finalizacion,
            estado=self.estado,
        )
