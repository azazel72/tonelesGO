from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoFlejeDB(SQLModel, table=True):
    __tablename__ = "estados_flejes"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
