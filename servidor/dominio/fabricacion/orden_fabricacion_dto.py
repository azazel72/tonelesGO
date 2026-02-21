
from datetime import date
from pydantic import BaseModel
from servidor.modelos import OrdenFabricacionDB


class OrdenFabricacionDTO(BaseModel):
    id: int | None
    numero: str
    fecha: date | None = None
    descripcion: str = ""
    fecha_finalizacion: date | None = None
    estado: int | None = None

    def from_db(orden_db: OrdenFabricacionDB) -> "OrdenFabricacionDTO":
        return OrdenFabricacionDTO(
            id=orden_db.id,
            numero=orden_db.numero,
            fecha=orden_db.fecha,
            descripcion=orden_db.descripcion,
            fecha_finalizacion=orden_db.fecha_finalizacion,
            estado=orden_db.estado,
        )

    def to_db(self) -> OrdenFabricacionDB:
        return OrdenFabricacionDB(
            id=self.id,
            numero=self.numero,
            fecha=self.fecha,
            descripcion=self.descripcion,
            fecha_finalizacion=self.fecha_finalizacion,
            estado=self.estado,
        )
