
from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional


class OrdenFabricacionDB(SQLModel, table=True):
    __tablename__ = "ordenes_fabricacion"

    id: Optional[int] = Field(default=None, primary_key=True)
    numero: str
    fecha: date | None = None
    descripcion: str = ""
    fecha_finalizacion: date | None = None
    estado: int | None = None
