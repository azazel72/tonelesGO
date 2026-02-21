from datetime import date
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
