from pydantic import BaseModel
from servidor.modelos import ConsumoDB


class ConsumoDTO(BaseModel):
    id: int | None
    bota_id: int
    consumible_id: int
    consumo: float = 0.0

    def from_db(consumo_db: ConsumoDB) -> "ConsumoDTO":
        return ConsumoDTO(
            id=consumo_db.id,
            bota_id=consumo_db.bota_id,
            consumible_id=consumo_db.consumible_id,
            consumo=consumo_db.consumo,
        )

    def to_db(self) -> ConsumoDB:
        return ConsumoDB(
            id=self.id,
            bota_id=self.bota_id,
            consumible_id=self.consumible_id,
            consumo=self.consumo,
        )
