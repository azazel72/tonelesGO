from datetime import datetime

from pydantic import BaseModel

from servidor.modelos import ProductoOperarioDB


class ProductoOperarioDTO(BaseModel):
    producto_id: int
    usuario_id: int
    created_at: datetime | None = None
    created_by: str = "system"

    def from_db(producto_operario_db: ProductoOperarioDB) -> "ProductoOperarioDTO":
        return ProductoOperarioDTO(
            producto_id=producto_operario_db.producto_id,
            usuario_id=producto_operario_db.usuario_id,
            created_at=producto_operario_db.created_at,
            created_by=producto_operario_db.created_by,
        )

    def to_db(self) -> ProductoOperarioDB:
        return ProductoOperarioDB(
            producto_id=self.producto_id,
            usuario_id=self.usuario_id,
            created_at=self.created_at,
            created_by=self.created_by,
        )
