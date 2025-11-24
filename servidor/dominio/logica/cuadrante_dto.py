from pydantic import BaseModel
from typing import List, Optional
from datetime import date

from servidor.dominio.logica.cuadrante_detalle_dto import CuadranteDetalleDTO
from servidor.modelos.logica.cuadrante_db import CuadranteDB

class CuadranteDTO(BaseModel):
    id: int | None
    fecha_inicio: date | None
    fecha_fin: date | None
    titulo: Optional[str] = None
    observaciones: Optional[str] = None
    detalles: Optional[List[CuadranteDetalleDTO]] = None

    def buscar_detalle_por_id(self, detalle_id: int) -> Optional[CuadranteDetalleDTO]:
        if self.detalles:
            for detalle in self.detalles:
                if detalle.id == detalle_id:
                    return detalle
        return None
    
    
    def from_db(cuadrante_db: CuadranteDB) -> "CuadranteDTO":
        return CuadranteDTO(
            id=cuadrante_db.id,
            fecha_inicio=cuadrante_db.fecha_inicio,
            fecha_fin=cuadrante_db.fecha_fin,
            titulo=cuadrante_db.titulo,
            observaciones=cuadrante_db.observaciones,
            detalles=None,
        )
    
    def to_db(self) -> CuadranteDB:
        return CuadranteDB(
            id=self.id,
            fecha_inicio=self.fecha_inicio,
            fecha_fin=self.fecha_fin,
            titulo=self.titulo,
            observaciones=self.observaciones,
            detalles=None,
        )
