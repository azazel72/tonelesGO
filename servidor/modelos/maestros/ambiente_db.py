from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field


class AmbienteDB(SQLModel, table=True):
    __tablename__ = "ambientes"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date
    toma: int
    temperatura: float
    humedad: float
