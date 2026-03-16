
from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional


class PedidoDB(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    numero: str = ""
    destino: str = "CLIENTE"
    cliente_id: int | None = None
    tipo_producto_id: int | None = None
    material_id: int | None = None
    cantidad: int = 0
    cantidad_fabricada: int = 0
    fecha: date | None = None
    descripcion: str = ""
    fecha_finalizacion: date | None = None
    estado: int | None = None
