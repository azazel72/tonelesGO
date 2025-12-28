
from sqlmodel import SQLModel, Field
from typing import Optional


class LineaPedidoDB(SQLModel, table=True):
    __tablename__ = "lineas_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int
    duela_id: int
    bultos: int = 0
    kilos: float = 0
    bultos_entregados: int = 0
    verificado: bool = False
