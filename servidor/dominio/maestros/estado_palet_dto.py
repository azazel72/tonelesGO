from pydantic import BaseModel

from servidor.modelos import EstadoPaletDB


class EstadoPaletDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoPaletDB) -> "EstadoPaletDTO":
        return EstadoPaletDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoPaletDB:
        return EstadoPaletDB(
            id=self.id,
            descripcion=self.descripcion,
        )
