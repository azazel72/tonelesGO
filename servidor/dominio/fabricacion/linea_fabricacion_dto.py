
from pydantic import BaseModel
from servidor.modelos import LineaFabricacionDB


class LineaFabricacionDTO(BaseModel):
    id: int | None
    orden_id: int
    tipo_producto_id: int
    material_id: int | None = None
    cantidad: int = 0
    cantidad_fabricada: int = 0
    estado: int | None = None

    def from_db(linea_db: LineaFabricacionDB) -> "LineaFabricacionDTO":
        return LineaFabricacionDTO(
            id=linea_db.id,
            orden_id=linea_db.orden_id,
            tipo_producto_id=linea_db.tipo_producto_id,
            material_id=linea_db.material_id,
            cantidad=linea_db.cantidad,
            cantidad_fabricada=linea_db.cantidad_fabricada,
            estado=linea_db.estado,
        )

    def to_db(self) -> LineaFabricacionDB:
        return LineaFabricacionDB(
            id=self.id,
            orden_id=self.orden_id,
            tipo_producto_id=self.tipo_producto_id,
            material_id=self.material_id,
            cantidad=self.cantidad,
            cantidad_fabricada=self.cantidad_fabricada,
            estado=self.estado,
        )
