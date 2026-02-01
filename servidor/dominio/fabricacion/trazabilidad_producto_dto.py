
from pydantic import BaseModel
from servidor.modelos import TrazabilidadProductoDB


class TrazabilidadProductoDTO(BaseModel):
    id: int | None
    trazabilidad_fabricacion_id: int
    producto_id: int

    def from_db(traz_db: TrazabilidadProductoDB) -> "TrazabilidadProductoDTO":
        return TrazabilidadProductoDTO(
            id=traz_db.id,
            trazabilidad_fabricacion_id=traz_db.trazabilidad_fabricacion_id,
            producto_id=traz_db.producto_id,
        )

    def to_db(self) -> TrazabilidadProductoDB:
        return TrazabilidadProductoDB(
            id=self.id,
            trazabilidad_fabricacion_id=self.trazabilidad_fabricacion_id,
            producto_id=self.producto_id,
        )
