from pydantic import BaseModel
from servidor.modelos import TostadoDB


class TostadoDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(tostado_db: TostadoDB) -> "TostadoDTO":
        return TostadoDTO(
            id=tostado_db.id,
            descripcion=tostado_db.descripcion,
        )

    def to_db(self) -> TostadoDB:
        return TostadoDB(
            id=self.id,
            descripcion=self.descripcion,
        )
