from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoTrazabilidadFabricacionDB(SQLModel, table=True):
    __tablename__ = "estados_trazabilidad_fabricacion"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
