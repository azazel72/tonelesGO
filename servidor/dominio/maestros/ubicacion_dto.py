from pydantic import BaseModel
from servidor.modelos import UbicacionDB


class UbicacionDTO(BaseModel):
    id: int | None
    descripcion: str
    instalacion_id: int
    orden: int

    def from_db(ubicacion_db: UbicacionDB) -> "UbicacionDTO":
        return UbicacionDTO(
            id=ubicacion_db.id,
            descripcion=ubicacion_db.descripcion,
            instalacion_id=ubicacion_db.instalacion_id,
            orden=ubicacion_db.orden
        )
    
    def to_db(self) -> UbicacionDB:
        return UbicacionDB(
            id=self.id,
            descripcion=self.descripcion,
            instalacion_id=self.instalacion_id,
            orden=self.orden
        )
