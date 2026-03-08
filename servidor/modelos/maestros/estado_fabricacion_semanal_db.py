from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoFabricacionSemanalDB(SQLModel, table=True):
    __tablename__ = "estados_fabricacion_semanal"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
