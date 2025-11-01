from pydantic import BaseModel
from servidor.modelos import EstadoDB


class EstadoDTO(BaseModel):
    id: int
    descripcion: str

    def from_db(estado_db: EstadoDB) -> "EstadoDTO":
        return EstadoDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion
        )
    
    def to_db(self) -> EstadoDB:
        return EstadoDB(
            id=self.id,
            descripcion=self.descripcion
        )

