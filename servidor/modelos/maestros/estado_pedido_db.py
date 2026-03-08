from sqlmodel import SQLModel, Field
from typing import Optional


class EstadoPedidoDB(SQLModel, table=True):
    __tablename__ = "estados_pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
