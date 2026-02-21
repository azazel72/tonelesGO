
from pydantic import BaseModel
from servidor.modelos import TipoProductoDB


class TipoProductoDTO(BaseModel):
    id: int | None
    codigo: str
    descripcion: str
    consumo: float = 0.0

    def from_db(tipo_db: TipoProductoDB) -> "TipoProductoDTO":
        return TipoProductoDTO(
            id=tipo_db.id,
            codigo=tipo_db.codigo,
            descripcion=tipo_db.descripcion,
            consumo=tipo_db.consumo,
        )

    def to_db(self) -> TipoProductoDB:
        return TipoProductoDB(
            id=self.id,
            codigo=self.codigo,
            descripcion=self.descripcion,
            consumo=self.consumo,
        )
