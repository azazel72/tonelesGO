from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class EntradaFlejeDB(SQLModel, table=True):
    __tablename__ = "entradas_flejes"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date
    tipo_producto_id: int
    lote: str
    peso: float
    consumido: float
    restante: float
    estado: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    is_deleted: bool = False
    created_by: str = "system"
    updated_by: str = "system"
    deleted_by: str | None = None
