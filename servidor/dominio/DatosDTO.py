from typing import Dict, Optional
from pydantic import BaseModel
from servidor.dominio.EntradasDTO import EntradasDTO
from servidor.modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB

class DatosDTO(BaseModel):
    datos: "DatosDTO" = None

    entradas: Optional[EntradasDTO] = None
    datos_maestros: Dict[str, list] = {
        "camiones": [],
        "facturacion": [],
        "materiales": []
    }

