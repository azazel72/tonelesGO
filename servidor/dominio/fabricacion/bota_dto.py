
from pydantic import BaseModel
from servidor.modelos import BotaDB


class BotaDTO(BaseModel):
    id: int | None
    codigo: str
    material_id: int | None = None
    vaso_producto_id: int
    fondo_producto_id: int
    tapa_producto_id: int
    fleje_1_id: int | None = None
    fleje_2_id: int | None = None
    fleje_3_id: int | None = None
    fleje_4_id: int | None = None
    fleje_5_id: int | None = None
    estado: int | None = None

    def from_db(bota_db: BotaDB) -> "BotaDTO":
        return BotaDTO(
            id=bota_db.id,
            codigo=bota_db.codigo,
            material_id=bota_db.material_id,
            vaso_producto_id=bota_db.vaso_producto_id,
            fondo_producto_id=bota_db.fondo_producto_id,
            tapa_producto_id=bota_db.tapa_producto_id,
            fleje_1_id=bota_db.fleje_1_id,
            fleje_2_id=bota_db.fleje_2_id,
            fleje_3_id=bota_db.fleje_3_id,
            fleje_4_id=bota_db.fleje_4_id,
            fleje_5_id=bota_db.fleje_5_id,
            estado=bota_db.estado,
        )

    def to_db(self) -> BotaDB:
        return BotaDB(
            id=self.id,
            codigo=self.codigo,
            material_id=self.material_id,
            vaso_producto_id=self.vaso_producto_id,
            fondo_producto_id=self.fondo_producto_id,
            tapa_producto_id=self.tapa_producto_id,
            fleje_1_id=self.fleje_1_id,
            fleje_2_id=self.fleje_2_id,
            fleje_3_id=self.fleje_3_id,
            fleje_4_id=self.fleje_4_id,
            fleje_5_id=self.fleje_5_id,
            estado=self.estado,
        )
