
from sqlmodel import SQLModel, Field
from typing import Optional


class ProductoDB(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    tipo: str
    codigo: str
    venta_id: Optional[int] = None
    produccion_id: Optional[int] = None
