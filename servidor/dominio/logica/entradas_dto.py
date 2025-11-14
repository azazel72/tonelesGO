from pydantic import BaseModel
from typing import List, Optional

from servidor.dominio.logica.plan_camion_dto import PlanCamionDTO
from servidor.dominio.logica.plan_facturacion_dto import PlanFacturacionDTO
from servidor.dominio.logica.plan_material_dto import PlanMaterialDTO

class EntradasDTO(BaseModel):
    año: Optional[int] = 0
    plan_camiones: Optional[List[PlanCamionDTO]] = None
    plan_facturacion: Optional[PlanFacturacionDTO] = None
    plan_materiales: Optional[List[PlanMaterialDTO]] = None

    def buscar_camion_por_id(self, camion_id: int) -> Optional[PlanCamionDTO]:
        if self.plan_camiones:
            for camion in self.plan_camiones:
                if camion.id == camion_id:
                    return camion
        return None
    
    def buscar_material_por_id(self, material_id: int) -> Optional[PlanMaterialDTO]:
        if self.plan_materiales:
            for material in self.plan_materiales:
                if material.id == material_id:
                    return material
        return None
    
    def buscar_facturacion_por_id(self, facturacion_id: int) -> Optional[PlanFacturacionDTO]:
        if self.plan_facturacion and self.plan_facturacion.id == facturacion_id:
            return self.plan_facturacion
        return None