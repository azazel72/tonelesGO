from pydantic import BaseModel
from typing import List, Optional
from datetime import date

from servidor.modelos.logica.cuadrante_detalle_db import CuadranteDetalleDB

class CuadranteDetalleDTO(BaseModel):
    id: int | None
    fecha: Optional[date] = None
    cuadrante_id: int
    puesto_id: int
    usuario_id: int
    orden_en_puesto: Optional[int] = 1

    def from_db(cuadrante_detalle_db: CuadranteDetalleDB) -> "CuadranteDetalleDTO":
        return CuadranteDetalleDTO(
            id=cuadrante_detalle_db.id,
            fecha=cuadrante_detalle_db.fecha,
            cuadrante_id=cuadrante_detalle_db.cuadrante_id,
            puesto_id=cuadrante_detalle_db.puesto_id,
            usuario_id=cuadrante_detalle_db.usuario_id,
            orden_en_puesto=cuadrante_detalle_db.orden_en_puesto,
        )
    
    def to_db(self) -> CuadranteDetalleDB:
        return CuadranteDetalleDB(
            id=self.id,
            fecha=self.fecha,
            cuadrante_id=self.cuadrante_id,
            puesto_id=self.puesto_id,
            usuario_id=self.usuario_id,
            orden_en_puesto=self.orden_en_puesto,
        )
