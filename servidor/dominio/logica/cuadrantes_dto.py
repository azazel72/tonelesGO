from datetime import date
from typing import Dict, List, Optional
from pydantic import BaseModel

from servidor.dominio.cuadrantes.cuadrante_dto import CuadranteDTO


class CuadrantesDTO(BaseModel):
    cuadrante_actual: Optional["CuadranteDTO"] = None
    cuadrantes: Optional[Dict[date, "CuadranteDTO"]] = {}

    def buscar_cuadrante_por_fecha(self, fecha: date) -> Optional[CuadranteDTO]:
        if self.cuadrantes and fecha in self.cuadrantes:
            return self.cuadrantes[fecha]
        return None