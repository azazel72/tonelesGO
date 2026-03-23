from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoProductoDB(SQLModel, table=True):
    __tablename__ = "estados_productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
