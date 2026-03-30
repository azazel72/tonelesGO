from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class TrazabilidadMovimientoDB(SQLModel, table=True):
    __tablename__ = "trazabilidad_movimientos"

    id: Optional[int] = Field(default=None, primary_key=True)
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
