
from sqlmodel import SQLModel, Field
from typing import Optional


class LineaFabricacionDB(SQLModel, table=True):
    __tablename__ = "lineas_fabricacion"

    id: Optional[int] = Field(default=None, primary_key=True)
    orden_id: int
    tipo_producto_id: int
    material_id: int | None = None
    cantidad: int = 0
    cantidad_fabricada: int = 0
    estado: int | None = None
