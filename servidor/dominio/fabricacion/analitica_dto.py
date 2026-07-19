from datetime import date, datetime

from pydantic import BaseModel

from servidor.modelos import AnaliticaDB


class AnaliticaDTO(BaseModel):
    id: int | None
    fecha: date
    descripcion: str
    estado: str = "ACTIVA"
    deposito: str | None = None
    litros: str | None = None
    alcohol: str | None = None
    av: str | None = None
    ph: str | None = None
    ntu: str | None = None
    azucar: str | None = None
    numero_botas: str | None = None
    cliente: str | None = None
    tipo_bota: str | None = None
    vo_at: str | None = None
    observaciones: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def from_db(analitica_db: AnaliticaDB) -> "AnaliticaDTO":
        return AnaliticaDTO(
            id=analitica_db.id,
            fecha=analitica_db.fecha,
            descripcion=analitica_db.descripcion,
            estado=analitica_db.estado,
            deposito=analitica_db.deposito,
            litros=analitica_db.litros,
            alcohol=analitica_db.alcohol,
            av=analitica_db.av,
            ph=analitica_db.ph,
            ntu=analitica_db.ntu,
            azucar=analitica_db.azucar,
            numero_botas=analitica_db.numero_botas,
            cliente=analitica_db.cliente,
            tipo_bota=analitica_db.tipo_bota,
            vo_at=analitica_db.vo_at,
            observaciones=analitica_db.observaciones,
            created_at=analitica_db.created_at,
            updated_at=analitica_db.updated_at,
        )

    def to_db(self) -> AnaliticaDB:
        return AnaliticaDB(
            id=self.id,
            fecha=self.fecha,
            descripcion=self.descripcion,
            estado=self.estado,
            deposito=self.deposito,
            litros=self.litros,
            alcohol=self.alcohol,
            av=self.av,
            ph=self.ph,
            ntu=self.ntu,
            azucar=self.azucar,
            numero_botas=self.numero_botas,
            cliente=self.cliente,
            tipo_bota=self.tipo_bota,
            vo_at=self.vo_at,
            observaciones=self.observaciones,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
