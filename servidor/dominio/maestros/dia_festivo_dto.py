from datetime import date
from pydantic import BaseModel
from servidor.modelos import DiaFestivoDB


class DiaFestivoDTO(BaseModel):
    id: int | None
    fecha: date

    def from_db(dia_festivo_db: DiaFestivoDB) -> "DiaFestivoDTO":
        return DiaFestivoDTO(
            id=dia_festivo_db.id,
            fecha=dia_festivo_db.fecha,
        )

    def to_db(self) -> DiaFestivoDB:
        return DiaFestivoDB(
            id=self.id,
            fecha=self.fecha,
        )
