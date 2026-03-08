from pydantic import BaseModel

from servidor.modelos import EstadoTrazabilidadFabricacionDB


class EstadoTrazabilidadFabricacionDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoTrazabilidadFabricacionDB) -> "EstadoTrazabilidadFabricacionDTO":
        return EstadoTrazabilidadFabricacionDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoTrazabilidadFabricacionDB:
        return EstadoTrazabilidadFabricacionDB(
            id=self.id,
            descripcion=self.descripcion,
        )
