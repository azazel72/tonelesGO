from pydantic import BaseModel, Field
from servidor.modelos import UsuarioDB


class UsuarioDTO(BaseModel):
    id: int | None
    codigo: str | None = None
    alias: str
    nombre: str
    rol_id: int | None
    empleado: bool | None = Field(default=False)
    activo: bool | None = Field(default=True)
    clave: str = Field(exclude=True)

    def from_db(usuario_db: UsuarioDB) -> "UsuarioDTO":
        return UsuarioDTO(
            id=usuario_db.id,
            codigo=usuario_db.codigo,
            alias=usuario_db.alias,
            nombre=usuario_db.nombre,
            rol_id=usuario_db.rol_id,
            empleado=usuario_db.empleado,
            activo=bool(getattr(usuario_db, "activo", True)),
            clave=usuario_db.clave
        )
    
    def to_db(self) -> UsuarioDB:
        return UsuarioDB(
            id=self.id,
            codigo=self.codigo,
            alias=self.alias,
            nombre=self.nombre,
            rol_id=self.rol_id,
            empleado=self.empleado,
            activo=self.activo,
            clave=self.clave
        )
        
