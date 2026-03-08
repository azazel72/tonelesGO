from sqlmodel import SQLModel, Field
from typing import Optional


class StockDB(SQLModel, table=True):
    __tablename__ = "stocks"

    id: Optional[int] = Field(default=None, primary_key=True)
    tipo_producto: int | None = None
    id_material: int | None = None
    id_instalacion: int | None = None
    cantidad_stock: float = 0.0
    cantidad_consumida: float = 0.0
    estado_palets: int | None = None
