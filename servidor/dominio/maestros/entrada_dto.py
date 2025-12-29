
from datetime import date
from pydantic import BaseModel
from servidor.modelos import EntradaDB


class EntradaDTO(BaseModel):
    id: int | None
    numero: str
    proveedor_id: int
    fecha: date | None
    entregado: bool = False
    anulado: bool = False

    def from_db(entrada_db: EntradaDB) -> "EntradaDTO":
        return EntradaDTO(
            id=entrada_db.id,
            numero=entrada_db.numero,
            proveedor_id=entrada_db.proveedor_id,
            fecha=entrada_db.fecha,
            entregado=entrada_db.entregado,
            anulado=entrada_db.anulado,
        )

    def to_db(self) -> EntradaDB:
        return EntradaDB(
            id=self.id,
            numero=self.numero,
            proveedor_id=self.proveedor_id,
            fecha=self.fecha,
            entregado=self.entregado,
            anulado=self.anulado,
        )
