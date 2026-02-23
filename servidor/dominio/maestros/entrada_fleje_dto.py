from datetime import date, datetime
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
    estado: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    is_deleted: bool = False
    created_by: str = "system"
    updated_by: str = "system"
    deleted_by: str | None = None

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
            estado=entrada_db.estado,
            created_at=entrada_db.created_at,
            updated_at=entrada_db.updated_at,
            deleted_at=entrada_db.deleted_at,
            is_deleted=entrada_db.is_deleted,
            created_by=entrada_db.created_by,
            updated_by=entrada_db.updated_by,
            deleted_by=entrada_db.deleted_by,
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
            estado=self.estado,
            created_at=self.created_at,
            updated_at=self.updated_at,
            deleted_at=self.deleted_at,
            is_deleted=self.is_deleted,
            created_by=self.created_by,
            updated_by=self.updated_by,
            deleted_by=self.deleted_by,
        )
