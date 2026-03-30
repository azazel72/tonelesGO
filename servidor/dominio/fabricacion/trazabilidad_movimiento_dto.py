from datetime import datetime

from pydantic import BaseModel, field_validator

from servidor.modelos import TrazabilidadMovimientoDB


class TrazabilidadMovimientoDTO(BaseModel):
    id: int | None
    fabricacion_semanal_id: int
    palet_origen_id: int
    palet_destino_id: int
    cantidad: float = 0.0
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    is_deleted: bool = False
    created_by: str = "system"
    updated_by: str = "system"
    deleted_by: str | None = None

    @field_validator("cantidad", mode="before")
    @classmethod
    def normalizar_decimal_vacio(cls, value):
        if value in ("", None):
            return 0
        return value

    def from_db(item_db: TrazabilidadMovimientoDB) -> "TrazabilidadMovimientoDTO":
        return TrazabilidadMovimientoDTO(
            id=item_db.id,
            fabricacion_semanal_id=item_db.fabricacion_semanal_id,
            palet_origen_id=item_db.palet_origen_id,
            palet_destino_id=item_db.palet_destino_id,
            cantidad=item_db.cantidad,
            created_at=item_db.created_at,
            updated_at=item_db.updated_at,
            deleted_at=item_db.deleted_at,
            is_deleted=item_db.is_deleted,
            created_by=item_db.created_by,
            updated_by=item_db.updated_by,
            deleted_by=item_db.deleted_by,
        )

    def to_db(self) -> TrazabilidadMovimientoDB:
        return TrazabilidadMovimientoDB(
            id=self.id,
            fabricacion_semanal_id=self.fabricacion_semanal_id,
            palet_origen_id=self.palet_origen_id,
            palet_destino_id=self.palet_destino_id,
            cantidad=self.cantidad,
            created_at=self.created_at,
            updated_at=self.updated_at,
            deleted_at=self.deleted_at,
            is_deleted=self.is_deleted,
            created_by=self.created_by,
            updated_by=self.updated_by,
            deleted_by=self.deleted_by,
        )
