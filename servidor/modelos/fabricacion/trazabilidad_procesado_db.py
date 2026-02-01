
from sqlmodel import SQLModel, Field
from typing import Optional


class TrazabilidadProcesadoDB(SQLModel, table=True):
    __tablename__ = "trazabilidad_procesado"

    id: Optional[int] = Field(default=None, primary_key=True)
    palet_origen_id: int
    palet_destino_id: int
