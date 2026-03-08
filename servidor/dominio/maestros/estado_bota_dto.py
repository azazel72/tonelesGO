from pydantic import BaseModel

from servidor.modelos import EstadoBotaDB


class EstadoBotaDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoBotaDB) -> "EstadoBotaDTO":
        return EstadoBotaDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoBotaDB:
        return EstadoBotaDB(
            id=self.id,
            descripcion=self.descripcion,
        )
