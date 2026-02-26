
from pydantic import BaseModel
from servidor.modelos import DuelaDB


class DuelaDTO(BaseModel):
    id: int | None
    descripcion: str
    material_id: int
    tipo_producto_id: int | None = None

    def from_db(duela_db: DuelaDB) -> "DuelaDTO":
        return DuelaDTO(
            id=duela_db.id,
            descripcion=duela_db.descripcion,
            material_id=duela_db.material_id,
            tipo_producto_id=duela_db.tipo_producto_id,
        )

    def to_db(self) -> DuelaDB:
        return DuelaDB(
            id=self.id,
            descripcion=self.descripcion,
            material_id=self.material_id,
            tipo_producto_id=self.tipo_producto_id,
        )
