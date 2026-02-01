
from pydantic import BaseModel
from servidor.modelos import TrazabilidadProcesadoDB


class TrazabilidadProcesadoDTO(BaseModel):
    id: int | None
    palet_origen_id: int
    palet_destino_id: int

    def from_db(traz_db: TrazabilidadProcesadoDB) -> "TrazabilidadProcesadoDTO":
        return TrazabilidadProcesadoDTO(
            id=traz_db.id,
            palet_origen_id=traz_db.palet_origen_id,
            palet_destino_id=traz_db.palet_destino_id,
        )

    def to_db(self) -> TrazabilidadProcesadoDB:
        return TrazabilidadProcesadoDB(
            id=self.id,
            palet_origen_id=self.palet_origen_id,
            palet_destino_id=self.palet_destino_id,
        )
