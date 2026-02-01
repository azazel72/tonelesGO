
from sqlmodel import SQLModel, Field
from typing import Optional


class TrazabilidadFabricacionDB(SQLModel, table=True):
    __tablename__ = "trazabilidad_fabricacion"

    id: Optional[int] = Field(default=None, primary_key=True)
    linea_fabricacion_id: int
    palet_id: int
    cantidad_fabricada: int = 0
    estado: int = 0
