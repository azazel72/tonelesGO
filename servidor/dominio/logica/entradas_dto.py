from pydantic import BaseModel
from typing import List, Optional
from servidor.modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB

class EntradasDTO(BaseModel):
    año: Optional[int] = 0
    plan_camiones: Optional[List[PlanCamionesDB]] = None
    plan_facturacion: Optional[PlanFacturacionDB] = None
    plan_materiales: Optional[List[PlanMaterialDB]] = None

