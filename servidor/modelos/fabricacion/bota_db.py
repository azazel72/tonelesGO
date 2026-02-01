
from sqlmodel import SQLModel, Field
from typing import Optional


class BotaDB(SQLModel, table=True):
    __tablename__ = "botas"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str
    vaso_producto_id: int
    fondo_producto_id: int
    tapa_producto_id: int
    estado: int | None = None
