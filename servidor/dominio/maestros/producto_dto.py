
from pydantic import BaseModel
from servidor.modelos import ProductoDB


class ProductoDTO(BaseModel):
    id: int | None
    tipo: str
    codigo: str
    material_id: int | None = None
    produccion_id: int | None

    def from_db(producto_db: ProductoDB) -> "ProductoDTO":
        return ProductoDTO(
            id=producto_db.id,
            tipo=producto_db.tipo,
            codigo=producto_db.codigo,
            material_id=producto_db.material_id,
            produccion_id=producto_db.produccion_id,
        )

    def to_db(self) -> ProductoDB:
        return ProductoDB(
            id=self.id,
            tipo=self.tipo,
            codigo=self.codigo,
            material_id=self.material_id,
            produccion_id=self.produccion_id,
        )
