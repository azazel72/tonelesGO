from pydantic import BaseModel
from servidor.modelos import ProveedorDB


class ProveedorDTO(BaseModel):
    id: int
    nombre: str

    def from_db(proveedor_db: ProveedorDB) -> "ProveedorDTO":
        return ProveedorDTO(
            id=proveedor_db.id,
            nombre=proveedor_db.nombre,
        )
    
    def to_db(self) -> ProveedorDB:
        return ProveedorDB(
            id=self.id,
            nombre=self.nombre,
        )

