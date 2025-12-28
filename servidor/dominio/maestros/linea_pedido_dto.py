
from pydantic import BaseModel
from servidor.modelos import LineaPedidoDB


class LineaPedidoDTO(BaseModel):
    id: int | None
    pedido_id: int
    duela_id: int
    bultos: int = 0
    kilos: float = 0
    bultos_entregados: int = 0
    verificado: bool = False

    def from_db(linea_db: LineaPedidoDB) -> "LineaPedidoDTO":
        return LineaPedidoDTO(
            id=linea_db.id,
            pedido_id=linea_db.pedido_id,
            duela_id=linea_db.duela_id,
            bultos=linea_db.bultos,
            kilos=linea_db.kilos,
            bultos_entregados=linea_db.bultos_entregados,
            verificado=linea_db.verificado,
        )

    def to_db(self) -> LineaPedidoDB:
        return LineaPedidoDB(
            id=self.id,
            pedido_id=self.pedido_id,
            duela_id=self.duela_id,
            bultos=self.bultos,
            kilos=self.kilos,
            bultos_entregados=self.bultos_entregados,
            verificado=self.verificado,
        )
