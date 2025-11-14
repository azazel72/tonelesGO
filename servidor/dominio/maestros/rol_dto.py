from pydantic import BaseModel, Field
from servidor.modelos import RolDB

class RolDTO(BaseModel):
    id: int | None
    nombre: str
    planificacion: bool
    recepcion: bool
    ubicacion: bool
    fabricacion: bool
    expedicion: bool
    trazabilidad: bool
    administrador: bool

    def from_db(rol_db: RolDB) -> "RolDTO":
        return RolDTO(
            id=rol_db.id,
            nombre=rol_db.nombre,
            planificacion=rol_db.planificacion,
            recepcion=rol_db.recepcion,
            ubicacion=rol_db.ubicacion,
            fabricacion=rol_db.fabricacion,
            expedicion=rol_db.expedicion,
            trazabilidad=rol_db.trazabilidad,
            administrador=rol_db.administrador
        )
    
    def to_db(self) -> RolDB:
        return RolDB(
            id=self.id,
            nombre=self.nombre,
            planificacion=self.planificacion,
            recepcion=self.recepcion,
            ubicacion=self.ubicacion,
            fabricacion=self.fabricacion,
            expedicion=self.expedicion,
            trazabilidad=self.trazabilidad,
            administrador=self.administrador
        )
        