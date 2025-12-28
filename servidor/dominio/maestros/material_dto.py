
from pydantic import BaseModel
from servidor.modelos import MaterialDB


class MaterialDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(material_db: MaterialDB) -> "MaterialDTO":
        return MaterialDTO(
            id=material_db.id,
            descripcion=material_db.descripcion,
        )

    def to_db(self) -> MaterialDB:
        return MaterialDB(
            id=self.id,
            descripcion=self.descripcion,
        )
