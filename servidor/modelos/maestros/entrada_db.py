
from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional


class EntradaDB(SQLModel, table=True):
    __tablename__ = "entradas"

    id: Optional[int] = Field(default=None, primary_key=True)
    numero: str
    proveedor_id: int
    fecha: date | None = None
    entregado: bool = False
    anulado: bool = False
