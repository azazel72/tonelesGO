
from pydantic import BaseModel
from servidor.modelos import TipoProductoDB


class TipoProductoDTO(BaseModel):
    id: int | None
    tipo: str = ""
    codigo: str
    descripcion: str

    def from_db(tipo_db: TipoProductoDB) -> "TipoProductoDTO":
        return TipoProductoDTO(
            id=tipo_db.id,
            tipo=tipo_db.tipo,
            codigo=tipo_db.codigo,
            descripcion=tipo_db.descripcion,
        )

    def to_db(self) -> TipoProductoDB:
        return TipoProductoDB(
            id=self.id,
            tipo=self.tipo,
            codigo=self.codigo,
            descripcion=self.descripcion,
        )
