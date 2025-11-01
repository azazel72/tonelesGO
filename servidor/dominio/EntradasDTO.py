from pydantic import BaseModel
from typing import List
from servidor.modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB

class EntradasDTO(BaseModel):
    año: int
    camiones: List[PlanCamionesDB]
    plan_facturacion: PlanFacturacionDB
    materiales: List[PlanMaterialDB]

