
from pydantic import BaseModel
from servidor.modelos import TipoProductoDB


class TipoProductoDTO(BaseModel):
    id: int | None
    codigo: str
    descripcion: str
    id_material: int

    def from_db(tipo_db: TipoProductoDB) -> "TipoProductoDTO":
        return TipoProductoDTO(
            id=tipo_db.id,
            codigo=tipo_db.codigo,
            descripcion=tipo_db.descripcion,
            id_material=tipo_db.id_material,
        )

    def to_db(self) -> TipoProductoDB:
        return TipoProductoDB(
            id=self.id,
            codigo=self.codigo,
            descripcion=self.descripcion,
            id_material=self.id_material,
        )
