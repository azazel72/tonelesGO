from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional

class CuadranteDB(SQLModel, table=True):
    __tablename__ = "cuadrantes"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha_inicio: date | None
    fecha_fin: date | None
    titulo: Optional[str] = None
    observaciones: Optional[str] = None