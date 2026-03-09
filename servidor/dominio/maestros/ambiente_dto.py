from datetime import date
from pydantic import BaseModel, field_validator
from servidor.modelos import AmbienteDB


class AmbienteDTO(BaseModel):
    id: int | None
    fecha: date
    temperatura_1: float = 0.0
    humedad_1: float = 0.0
    temperatura_2: float = 0.0
    humedad_2: float = 0.0
    temperatura_3: float = 0.0
    humedad_3: float = 0.0

    @field_validator(
        "temperatura_1",
        "humedad_1",
        "temperatura_2",
        "humedad_2",
        "temperatura_3",
        "humedad_3",
        mode="before",
    )
    @classmethod
    def normalizar_decimal_vacio(cls, value):
        if value in ("", None):
            return 0
        return value

    def from_db(ambiente_db: AmbienteDB) -> "AmbienteDTO":
        return AmbienteDTO(
            id=ambiente_db.id,
            fecha=ambiente_db.fecha,
            temperatura_1=ambiente_db.temperatura_1,
            humedad_1=ambiente_db.humedad_1,
            temperatura_2=ambiente_db.temperatura_2,
            humedad_2=ambiente_db.humedad_2,
            temperatura_3=ambiente_db.temperatura_3,
            humedad_3=ambiente_db.humedad_3,
        )

    def to_db(self) -> AmbienteDB:
        return AmbienteDB(
            id=self.id,
            fecha=self.fecha,
            temperatura_1=self.temperatura_1,
            humedad_1=self.humedad_1,
            temperatura_2=self.temperatura_2,
            humedad_2=self.humedad_2,
            temperatura_3=self.temperatura_3,
            humedad_3=self.humedad_3,
        )
