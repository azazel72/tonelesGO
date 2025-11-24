from pydantic import BaseModel
from servidor.modelos import PuestoTrabajoDB


class PuestoTrabajoDTO(BaseModel):
    id: int | None
    nombre: str

    def from_db(puesto_trabajo_db: PuestoTrabajoDB) -> "PuestoTrabajoDTO":
        return PuestoTrabajoDTO(
            id=puesto_trabajo_db.id,
            nombre=puesto_trabajo_db.nombre
        )
    
    def to_db(self) -> "PuestoTrabajoDB":
        return PuestoTrabajoDB(
            id=self.id,
            nombre=self.nombre
        )