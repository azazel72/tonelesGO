from datetime import date
from pydantic import BaseModel, field_validator
from servidor.modelos import EntradaFlejeDB


class EntradaFlejeDTO(BaseModel):
    id: int | None
    fecha: date
    tipo_producto_id: int
    lote: str
    peso: float = 0.0
    consumido: float = 0.0
    restante: float = 0.0

    @field_validator("peso", "consumido", "restante", mode="before")
    @classmethod
    def normalizar_decimal_vacio(cls, value):
        if value in ("", None):
            return 0
        return value

    def from_db(entrada_db: EntradaFlejeDB) -> "EntradaFlejeDTO":
        return EntradaFlejeDTO(
            id=entrada_db.id,
            fecha=entrada_db.fecha,
            tipo_producto_id=entrada_db.tipo_producto_id,
            lote=entrada_db.lote,
            peso=entrada_db.peso,
            consumido=entrada_db.consumido,
            restante=entrada_db.restante,
        )

    def to_db(self) -> EntradaFlejeDB:
        return EntradaFlejeDB(
            id=self.id,
            fecha=self.fecha,
            tipo_producto_id=self.tipo_producto_id,
            lote=self.lote,
            peso=self.peso,
            consumido=self.consumido,
            restante=self.restante,
        )
