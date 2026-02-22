
from pydantic import BaseModel, field_validator
from servidor.modelos import PaletDB


class PaletDTO(BaseModel):
    id: int | None
    codigo: str
    linea_entrada_id: int | None = None
    duela_tipo_id: int | None = None
    cubicaje: float = 0.0
    consumido: float = 0.0
    estado: int | None = None
    ubicacion_id: int | None = None
    procesado: bool = False

    @field_validator("cubicaje", "consumido", mode="before")
    @classmethod
    def normalizar_decimal_vacio(cls, value):
        if value in ("", None):
            return 0
        return value

    def from_db(palet_db: PaletDB) -> "PaletDTO":
        return PaletDTO(
            id=palet_db.id,
            codigo=palet_db.codigo,
            linea_entrada_id=palet_db.linea_entrada_id,
            duela_tipo_id=palet_db.duela_tipo_id,
            cubicaje=palet_db.cubicaje,
            consumido=palet_db.consumido,
            estado=palet_db.estado,
            ubicacion_id=palet_db.ubicacion_id,
            procesado=palet_db.procesado,
        )

    def to_db(self) -> PaletDB:
        return PaletDB(
            id=self.id,
            codigo=self.codigo,
            linea_entrada_id=self.linea_entrada_id,
            duela_tipo_id=self.duela_tipo_id,
            cubicaje=self.cubicaje,
            consumido=self.consumido,
            estado=self.estado,
            ubicacion_id=self.ubicacion_id,
            procesado=self.procesado,
        )
