from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoOrdenFabricacionDB(SQLModel, table=True):
    __tablename__ = "estados_ordenes_fabricacion"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
