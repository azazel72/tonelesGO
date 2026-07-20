from pydantic import BaseModel
from servidor.modelos import EstadoFlejeDB


class EstadoFlejeDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoFlejeDB) -> "EstadoFlejeDTO":
        return EstadoFlejeDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoFlejeDB:
        return EstadoFlejeDB(
            id=self.id,
            descripcion=self.descripcion,
        )
