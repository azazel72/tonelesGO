
from sqlmodel import SQLModel, Field
from typing import Optional


class PaletDB(SQLModel, table=True):
    __tablename__ = "palets"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str
    linea_entrada_id: int
    ubicacion_id: int
    procesado: bool = False
