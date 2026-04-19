
from pydantic import BaseModel
from servidor.modelos import TrazabilidadFabricacionDB


class TrazabilidadFabricacionDTO(BaseModel):
    id: int | None
    fabricacion_semanal_id: int | None = None
    palet_id: int
    cantidad_fabricada: int = 0
    estado: int = 0

    def from_db(traz_db: TrazabilidadFabricacionDB) -> "TrazabilidadFabricacionDTO":
        return TrazabilidadFabricacionDTO(
            id=traz_db.id,
            fabricacion_semanal_id=traz_db.fabricacion_semanal_id,
            palet_id=traz_db.palet_id,
            cantidad_fabricada=traz_db.cantidad_fabricada,
            estado=traz_db.estado,
        )

    def to_db(self) -> TrazabilidadFabricacionDB:
        return TrazabilidadFabricacionDB(
            id=self.id,
            fabricacion_semanal_id=self.fabricacion_semanal_id,
            palet_id=self.palet_id,
            cantidad_fabricada=self.cantidad_fabricada,
            estado=self.estado,
        )
