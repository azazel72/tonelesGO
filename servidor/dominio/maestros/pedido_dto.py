
from datetime import date
from pydantic import BaseModel
from servidor.modelos import PedidoDB


class PedidoDTO(BaseModel):
    id: int | None
    numero: str
    proveedor_id: int
    fecha: date | None
    entregado: bool = False
    anulado: bool = False

    def from_db(pedido_db: PedidoDB) -> "PedidoDTO":
        return PedidoDTO(
            id=pedido_db.id,
            numero=pedido_db.numero,
            proveedor_id=pedido_db.proveedor_id,
            fecha=pedido_db.fecha,
            entregado=pedido_db.entregado,
            anulado=pedido_db.anulado,
        )

    def to_db(self) -> PedidoDB:
        return PedidoDB(
            id=self.id,
            numero=self.numero,
            proveedor_id=self.proveedor_id,
            fecha=self.fecha,
            entregado=self.entregado,
            anulado=self.anulado,
        )
