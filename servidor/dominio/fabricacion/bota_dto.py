
from pydantic import BaseModel
from servidor.modelos import BotaDB


class BotaDTO(BaseModel):
    id: int | None
    codigo: str
    vaso_producto_id: int
    fondo_producto_id: int
    tapa_producto_id: int
    estado: int | None = None

    def from_db(bota_db: BotaDB) -> "BotaDTO":
        return BotaDTO(
            id=bota_db.id,
            codigo=bota_db.codigo,
            vaso_producto_id=bota_db.vaso_producto_id,
            fondo_producto_id=bota_db.fondo_producto_id,
            tapa_producto_id=bota_db.tapa_producto_id,
            estado=bota_db.estado,
        )

    def to_db(self) -> BotaDB:
        return BotaDB(
            id=self.id,
            codigo=self.codigo,
            vaso_producto_id=self.vaso_producto_id,
            fondo_producto_id=self.fondo_producto_id,
            tapa_producto_id=self.tapa_producto_id,
            estado=self.estado,
        )
