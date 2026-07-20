from pydantic import BaseModel
from servidor.modelos import PuestoTrabajoDB


class PuestoTrabajoDTO(BaseModel):
    id: int | None
    nombre: str
    orden: int = 0
    listado: bool = False
    fabricacion: bool = False
    activo: bool = True

    def from_db(puesto_trabajo_db: PuestoTrabajoDB) -> "PuestoTrabajoDTO":
        return PuestoTrabajoDTO(
            id=puesto_trabajo_db.id,
            nombre=puesto_trabajo_db.nombre,
            orden=int(getattr(puesto_trabajo_db, "orden", 0) or 0),
            listado=bool(getattr(puesto_trabajo_db, "listado", False)),
            fabricacion=bool(getattr(puesto_trabajo_db, "fabricacion", False)),
            activo=bool(getattr(puesto_trabajo_db, "activo", True)),
        )
    
    def to_db(self) -> "PuestoTrabajoDB":
        return PuestoTrabajoDB(
            id=self.id,
            nombre=self.nombre,
            orden=self.orden,
            listado=self.listado,
            fabricacion=self.fabricacion,
            activo=self.activo,
        )
