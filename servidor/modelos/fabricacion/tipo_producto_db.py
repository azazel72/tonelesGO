
from sqlmodel import SQLModel, Field
from typing import Optional


class TipoProductoDB(SQLModel, table=True):
    __tablename__ = "tipos_producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str
    descripcion: str
    id_material: int
