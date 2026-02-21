from datetime import date
from pydantic import BaseModel
from servidor.modelos import AmbienteDB


class AmbienteDTO(BaseModel):
    id: int | None
    fecha: date
    toma: int
    temperatura: float
    humedad: float

    def from_db(ambiente_db: AmbienteDB) -> "AmbienteDTO":
        return AmbienteDTO(
            id=ambiente_db.id,
            fecha=ambiente_db.fecha,
            toma=ambiente_db.toma,
            temperatura=ambiente_db.temperatura,
            humedad=ambiente_db.humedad,
        )

    def to_db(self) -> AmbienteDB:
        return AmbienteDB(
            id=self.id,
            fecha=self.fecha,
            toma=self.toma,
            temperatura=self.temperatura,
            humedad=self.humedad,
        )
