
from pydantic import BaseModel
from servidor.modelos import PaletDB


class PaletDTO(BaseModel):
    id: int | None
    codigo: str
    linea_pedido_id: int
    ubicacion_id: int
    procesado: bool = False

    def from_db(palet_db: PaletDB) -> "PaletDTO":
        return PaletDTO(
            id=palet_db.id,
            codigo=palet_db.codigo,
            linea_pedido_id=palet_db.linea_pedido_id,
            ubicacion_id=palet_db.ubicacion_id,
            procesado=palet_db.procesado,
        )

    def to_db(self) -> PaletDB:
        return PaletDB(
            id=self.id,
            codigo=self.codigo,
            linea_pedido_id=self.linea_pedido_id,
            ubicacion_id=self.ubicacion_id,
            procesado=self.procesado,
        )
