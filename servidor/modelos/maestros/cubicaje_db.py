from sqlmodel import SQLModel, Field
from typing import Optional


class CubicajeDB(SQLModel, table=True):
    __tablename__ = "cubicaje"

    id: Optional[int] = Field(default=None, primary_key=True)
    tipo_producto_id: int
    cubicaje_estandar: float = 0.0
