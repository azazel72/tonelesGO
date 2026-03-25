from sqlmodel import SQLModel, Field
from typing import Optional


class ContenedorDB(SQLModel, table=True):
    __tablename__ = "contenedores"

    id: Optional[int] = Field(default=None, primary_key=True)
    contenedor: str = Field(max_length=64)
    pedido_id: int
