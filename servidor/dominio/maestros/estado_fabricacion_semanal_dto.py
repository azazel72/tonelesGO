from pydantic import BaseModel

from servidor.modelos import EstadoFabricacionSemanalDB


class EstadoFabricacionSemanalDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoFabricacionSemanalDB) -> "EstadoFabricacionSemanalDTO":
        return EstadoFabricacionSemanalDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoFabricacionSemanalDB:
        return EstadoFabricacionSemanalDB(
            id=self.id,
            descripcion=self.descripcion,
        )
