from pydantic import BaseModel
from servidor.modelos import ContenedorDB


class ContenedorDTO(BaseModel):
    id: int | None
    contenedor: str
    pedido_id: int

    def from_db(contenedor_db: ContenedorDB) -> "ContenedorDTO":
        return ContenedorDTO(
            id=contenedor_db.id,
            contenedor=contenedor_db.contenedor,
            pedido_id=contenedor_db.pedido_id,
        )

    def to_db(self) -> ContenedorDB:
        return ContenedorDB(
            id=self.id,
            contenedor=self.contenedor,
            pedido_id=self.pedido_id,
        )
