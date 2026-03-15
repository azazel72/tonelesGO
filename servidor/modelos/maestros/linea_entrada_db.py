
from sqlmodel import SQLModel, Field
from typing import Optional


class LineaEntradaDB(SQLModel, table=True):
    __tablename__ = "lineas_entrada"

    id: Optional[int] = Field(default=None, primary_key=True)
    entrada_id: int
    tipo_producto_id: int | None = None
    material_id: int | None = None
    bultos: int = 0
    kilos: float = 0
    bultos_entregados: int = 0
    verificado: bool = False
