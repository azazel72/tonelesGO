
from sqlmodel import SQLModel, Field
from typing import Optional


class BotaDB(SQLModel, table=True):
    __tablename__ = "botas"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str
    tipo_producto_id: int | None = None
    material_id: int | None = None
    vaso_producto_id: int
    fondo_producto_id: int
    tapa_producto_id: int
    fleje_1_id: int | None = None
    fleje_2_id: int | None = None
    fleje_3_id: int | None = None
    fleje_4_id: int | None = None
    fleje_5_id: int | None = None
    estado: int | None = None
