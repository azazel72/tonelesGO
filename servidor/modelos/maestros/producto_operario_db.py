from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class ProductoOperarioDB(SQLModel, table=True):
    __tablename__ = "productos_operarios"

    producto_id: int = Field(primary_key=True, foreign_key="productos.id")
    usuario_id: int = Field(primary_key=True, foreign_key="usuarios.id")
    codigo_batidero: int | None = None
    created_at: Optional[datetime] = Field(default=None)
    created_by: str = Field(default="system")
