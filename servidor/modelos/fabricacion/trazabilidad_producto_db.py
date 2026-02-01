
from sqlmodel import SQLModel, Field
from typing import Optional


class TrazabilidadProductoDB(SQLModel, table=True):
    __tablename__ = "trazabilidad_producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    trazabilidad_fabricacion_id: int
    producto_id: int
