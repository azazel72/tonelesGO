from datetime import date, datetime

from pydantic import BaseModel

from servidor.modelos import AnaliticaDB


class AnaliticaDTO(BaseModel):
    id: int | None
    fecha: date
    descripcion: str
    estado: str = "ACTIVA"
    grado_alcoholico: str | None = None
    ph: str | None = None
    acidez_total: str | None = None
    acidez_volatil: str | None = None
    so2_libre: str | None = None
    so2_total: str | None = None
    azucar_residual: str | None = None
    temperatura: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def from_db(analitica_db: AnaliticaDB) -> "AnaliticaDTO":
        return AnaliticaDTO(
            id=analitica_db.id,
            fecha=analitica_db.fecha,
            descripcion=analitica_db.descripcion,
            estado=analitica_db.estado,
            grado_alcoholico=analitica_db.grado_alcoholico,
            ph=analitica_db.ph,
            acidez_total=analitica_db.acidez_total,
            acidez_volatil=analitica_db.acidez_volatil,
            so2_libre=analitica_db.so2_libre,
            so2_total=analitica_db.so2_total,
            azucar_residual=analitica_db.azucar_residual,
            temperatura=analitica_db.temperatura,
            created_at=analitica_db.created_at,
            updated_at=analitica_db.updated_at,
        )

    def to_db(self) -> AnaliticaDB:
        return AnaliticaDB(
            id=self.id,
            fecha=self.fecha,
            descripcion=self.descripcion,
            estado=self.estado,
            grado_alcoholico=self.grado_alcoholico,
            ph=self.ph,
            acidez_total=self.acidez_total,
            acidez_volatil=self.acidez_volatil,
            so2_libre=self.so2_libre,
            so2_total=self.so2_total,
            azucar_residual=self.azucar_residual,
            temperatura=self.temperatura,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
