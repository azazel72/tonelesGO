from pydantic import BaseModel
from servidor.modelos import ClienteDB


class ClienteDTO(BaseModel):
    id: int
    nombre: str

    def from_db(cliente_db: ClienteDB) -> "ClienteDTO":
        return ClienteDTO(
            id=cliente_db.id,
            nombre=cliente_db.nombre
        )
    
    def to_db(self) -> "ClienteDB":
        return ClienteDB(
            id=self.id,
            nombre=self.nombre
        )