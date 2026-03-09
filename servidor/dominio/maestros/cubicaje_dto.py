from pydantic import BaseModel, field_validator
from servidor.modelos import CubicajeDB


class CubicajeDTO(BaseModel):
    id: int | None
    tipo_producto_id: int
    cubicaje_estandar: float = 0.0

    @field_validator("cubicaje_estandar", mode="before")
    @classmethod
    def normalizar_decimal_vacio(cls, value):
        if value in ("", None):
            return 0
        return value

    def from_db(cubicaje_db: CubicajeDB) -> "CubicajeDTO":
        return CubicajeDTO(
            id=cubicaje_db.id,
            tipo_producto_id=cubicaje_db.tipo_producto_id,
            cubicaje_estandar=cubicaje_db.cubicaje_estandar,
        )

    def to_db(self) -> CubicajeDB:
        return CubicajeDB(
            id=self.id,
            tipo_producto_id=self.tipo_producto_id,
            cubicaje_estandar=self.cubicaje_estandar,
        )
