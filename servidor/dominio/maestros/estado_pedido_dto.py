from pydantic import BaseModel

from servidor.modelos import EstadoPedidoDB


class EstadoPedidoDTO(BaseModel):
    id: int | None
    descripcion: str

    def from_db(estado_db: EstadoPedidoDB) -> "EstadoPedidoDTO":
        return EstadoPedidoDTO(
            id=estado_db.id,
            descripcion=estado_db.descripcion,
        )

    def to_db(self) -> EstadoPedidoDB:
        return EstadoPedidoDB(
            id=self.id,
            descripcion=self.descripcion,
        )
