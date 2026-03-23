from pydantic import BaseModel
from servidor.modelos import EstadoProductoDB


class EstadoProductoDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoProductoDB) -> "EstadoProductoDTO":
        return EstadoProductoDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoProductoDB:
        return EstadoProductoDB(
            id=self.id,
            descripcion=self.descripcion,
        )
