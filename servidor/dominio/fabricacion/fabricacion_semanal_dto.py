
from pydantic import BaseModel
from datetime import date
from servidor.modelos import FabricacionSemanalDB


class FabricacionSemanalDTO(BaseModel):
    id: int | None
    pedido_id: int
    fecha_inicio: date | None = None
    tipo_producto_id: int
    material_id: int | None = None
    cantidad: int = 0
    cantidad_fabricada: int = 0
    estado: int | None = None

    def from_db(linea_db: FabricacionSemanalDB) -> "FabricacionSemanalDTO":
        return FabricacionSemanalDTO(
            id=linea_db.id,
            pedido_id=linea_db.pedido_id,
            fecha_inicio=linea_db.fecha_inicio,
            tipo_producto_id=linea_db.tipo_producto_id,
            material_id=linea_db.material_id,
            cantidad=linea_db.cantidad,
            cantidad_fabricada=linea_db.cantidad_fabricada,
            estado=linea_db.estado,
        )

    def to_db(self) -> FabricacionSemanalDB:
        return FabricacionSemanalDB(
            id=self.id,
            pedido_id=self.pedido_id,
            fecha_inicio=self.fecha_inicio,
            tipo_producto_id=self.tipo_producto_id,
            material_id=self.material_id,
            cantidad=self.cantidad,
            cantidad_fabricada=self.cantidad_fabricada,
            estado=self.estado,
        )
