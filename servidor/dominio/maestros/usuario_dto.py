from pydantic import BaseModel, Field
from servidor.modelos import UsuarioDB


class UsuarioDTO(BaseModel):
    id: int
    username: str
    fullname: str
    rol: str
    password_hash: str = Field(exclude=True)

    def from_db(usuario_db: UsuarioDB) -> "UsuarioDTO":
        return UsuarioDTO(
            id=usuario_db.id,
            username=usuario_db.username,
            fullname=usuario_db.fullname,
            rol=usuario_db.role,
            password_hash=usuario_db.password_hash
        )
    
    def to_db(self) -> UsuarioDB:
        return UsuarioDB(
            id=self.id,
            username=self.username,
            fullname=self.fullname,
            role=self.rol,
            password_hash=self.password_hash
        )
        