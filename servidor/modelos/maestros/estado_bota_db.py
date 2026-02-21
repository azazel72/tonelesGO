from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoBotaDB(SQLModel, table=True):
    __tablename__ = "estados_botas"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
