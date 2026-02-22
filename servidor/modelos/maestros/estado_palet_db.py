from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoPaletDB(SQLModel, table=True):
    __tablename__ = "estados_palets"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
