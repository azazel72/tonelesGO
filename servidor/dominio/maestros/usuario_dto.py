from pydantic import BaseModel
from servidor.modelos import UsuarioDB


class UsuarioDTO(BaseModel):
    id: int
    username: str
    fullname: str
    rol: str

    def from_db(usuario_db: UsuarioDB) -> "UsuarioDTO":
        return UsuarioDTO(
            id=usuario_db.id,
            username=usuario_db.username,
            fullname=usuario_db.fullname,
            rol=usuario_db.rol
        )
    
    def to_db(self) -> UsuarioDB:
        return UsuarioDB(
            id=self.id,
            username=self.username,
            fullname=self.fullname,
            rol=self.rol
        )

