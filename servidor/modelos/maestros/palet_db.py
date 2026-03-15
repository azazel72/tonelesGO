
from sqlmodel import SQLModel, Field
from typing import Optional


class PaletDB(SQLModel, table=True):
    __tablename__ = "palets"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str
    linea_entrada_id: int | None = None
    tipo_producto_id: int | None = None
    material_id: int | None = None
    cubicaje: float = 0.0
    consumido: float = 0.0
    estado: int | None = None
    ubicacion_id: int | None = None
    procesado: bool = False
