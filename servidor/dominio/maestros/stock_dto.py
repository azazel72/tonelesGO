from pydantic import BaseModel, field_validator
from servidor.modelos import StockDB


class StockDTO(BaseModel):
    id: int | None
    tipo_producto: int | None = None
    id_material: int | None = None
    id_instalacion: int | None = None
    cantidad_stock: float = 0.0
    cantidad_consumida: float = 0.0
    estado_palets: int | None = None

    @field_validator("cantidad_stock", "cantidad_consumida", mode="before")
    @classmethod
    def normalizar_decimal_vacio(cls, value):
        if value in ("", None):
            return 0
        return value

    def from_db(stock_db: StockDB) -> "StockDTO":
        return StockDTO(
            id=stock_db.id,
            tipo_producto=stock_db.tipo_producto,
            id_material=stock_db.id_material,
            id_instalacion=stock_db.id_instalacion,
            cantidad_stock=stock_db.cantidad_stock,
            cantidad_consumida=stock_db.cantidad_consumida,
            estado_palets=stock_db.estado_palets,
        )

    def to_db(self) -> StockDB:
        return StockDB(
            id=self.id,
            tipo_producto=self.tipo_producto,
            id_material=self.id_material,
            id_instalacion=self.id_instalacion,
            cantidad_stock=self.cantidad_stock,
            cantidad_consumida=self.cantidad_consumida,
            estado_palets=self.estado_palets,
        )
