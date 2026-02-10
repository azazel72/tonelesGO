
from pydantic import BaseModel
from servidor.modelos import ProductoDB


class ProductoDTO(BaseModel):
    id: int | None
    tipo: str
    codigo: str
    venta_id: int | None
    produccion_id: int | None
    fabricado_por_id: int | None = None

    def from_db(producto_db: ProductoDB) -> "ProductoDTO":
        return ProductoDTO(
            id=producto_db.id,
            tipo=producto_db.tipo,
            codigo=producto_db.codigo,
            venta_id=producto_db.venta_id,
            produccion_id=producto_db.produccion_id,
            fabricado_por_id=producto_db.fabricado_por_id,
        )

    def to_db(self) -> ProductoDB:
        return ProductoDB(
            id=self.id,
            tipo=self.tipo,
            codigo=self.codigo,
            venta_id=self.venta_id,
            produccion_id=self.produccion_id,
            fabricado_por_id=self.fabricado_por_id,
        )
