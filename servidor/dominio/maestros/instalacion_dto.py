from pydantic import BaseModel
from servidor.modelos import InstalacionDB


class InstalacionDTO(BaseModel):
    id: int
    nombre: str
    tipo: str

    def from_db(instalacion_db: InstalacionDB) -> "InstalacionDTO":
        return InstalacionDTO(
            id=instalacion_db.id,
            nombre=instalacion_db.nombre,
            tipo=instalacion_db.tipo,
        )
    
    def to_db(self) -> InstalacionDB:
        return InstalacionDB(
            id=self.id,
            nombre=self.nombre,
            tipo=self.tipo,
        )
