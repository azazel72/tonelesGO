
from sqlmodel import SQLModel, Field
from typing import Optional


class TipoProductoDB(SQLModel, table=True):
    __tablename__ = "tipos_producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    tipo: str = ""
    codigo: str
    descripcion: str
    consumo: float = 0.0
