
from sqlmodel import SQLModel, Field
from typing import Optional


class DuelaDB(SQLModel, table=True):
    __tablename__ = "duelas"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
    material_id: int
    tipo_producto_id: int | None = None
