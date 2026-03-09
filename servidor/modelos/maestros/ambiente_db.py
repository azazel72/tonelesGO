from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field


class AmbienteDB(SQLModel, table=True):
    __tablename__ = "ambientes"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date
    temperatura_1: float = 0.0
    humedad_1: float = 0.0
    temperatura_2: float = 0.0
    humedad_2: float = 0.0
    temperatura_3: float = 0.0
    humedad_3: float = 0.0
