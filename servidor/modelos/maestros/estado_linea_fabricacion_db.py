from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoLineaFabricacionDB(SQLModel, table=True):
    __tablename__ = "estados_lineas_fabricacion"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
