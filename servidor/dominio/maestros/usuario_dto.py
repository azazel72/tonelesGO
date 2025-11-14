from pydantic import BaseModel, Field
from servidor.modelos import UsuarioDB


class UsuarioDTO(BaseModel):
    id: int | None
    alias: str
    nombre: str
    rol_id: int | None
    clave: str = Field(exclude=True)

    def from_db(usuario_db: UsuarioDB) -> "UsuarioDTO":
        return UsuarioDTO(
            id=usuario_db.id,
            alias=usuario_db.alias,
            nombre=usuario_db.nombre,
            rol_id=usuario_db.rol_id,
            clave=usuario_db.clave
        )
    
    def to_db(self) -> UsuarioDB:
        return UsuarioDB(
            id=self.id,
            alias=self.alias,
            nombre=self.nombre,
            rol_id=self.rol_id,
            clave=self.clave
        )
        