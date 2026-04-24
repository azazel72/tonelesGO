from pydantic import BaseModel
from servidor.modelos import PuestoTrabajoDB


class PuestoTrabajoDTO(BaseModel):
    id: int | None
    nombre: str
    orden: int = 0
    es_maquinaria: bool = False
    fabricacion: bool = False

    def from_db(puesto_trabajo_db: PuestoTrabajoDB) -> "PuestoTrabajoDTO":
        return PuestoTrabajoDTO(
            id=puesto_trabajo_db.id,
            nombre=puesto_trabajo_db.nombre,
            orden=int(getattr(puesto_trabajo_db, "orden", 0) or 0),
            es_maquinaria=bool(getattr(puesto_trabajo_db, "es_maquinaria", False)),
            fabricacion=bool(getattr(puesto_trabajo_db, "fabricacion", False)),
        )
    
    def to_db(self) -> "PuestoTrabajoDB":
        return PuestoTrabajoDB(
            id=self.id,
            nombre=self.nombre,
            orden=self.orden,
            es_maquinaria=self.es_maquinaria,
            fabricacion=self.fabricacion,
        )
