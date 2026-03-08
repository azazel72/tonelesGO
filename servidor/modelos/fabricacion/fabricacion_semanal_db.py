
from sqlmodel import SQLModel, Field
from datetime import date
from typing import Optional


class FabricacionSemanalDB(SQLModel, table=True):
    __tablename__ = "fabricacion_semanal"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int
    fecha_inicio: date | None = None
    tipo_producto_id: int
    material_id: int | None = None
    cantidad: int = 0
    cantidad_fabricada: int = 0
    estado: int | None = None
