
from datetime import date
from pydantic import BaseModel
from servidor.modelos import OrdenFabricacionDB


class OrdenFabricacionDTO(BaseModel):
    id: int | None
    numero: str
    fecha: date | None = None
    cliente_id: int | None = None
    estado: int | None = None

    def from_db(orden_db: OrdenFabricacionDB) -> "OrdenFabricacionDTO":
        return OrdenFabricacionDTO(
            id=orden_db.id,
            numero=orden_db.numero,
            fecha=orden_db.fecha,
            cliente_id=orden_db.cliente_id,
            estado=orden_db.estado,
        )

    def to_db(self) -> OrdenFabricacionDB:
        return OrdenFabricacionDB(
            id=self.id,
            numero=self.numero,
            fecha=self.fecha,
            cliente_id=self.cliente_id,
            estado=self.estado,
        )
