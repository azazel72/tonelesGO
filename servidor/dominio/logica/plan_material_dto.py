from pydantic import BaseModel
from typing import List, Optional

from servidor.modelos import PlanMaterialDB

class PlanMaterialDTO(BaseModel):
    id: int | None
    año: int
    tipo_material: str | None
    total_pactados: float = 0
    total_descontar: float = 0
    enero: float = 0
    febrero: float = 0
    marzo: float = 0
    abril: float = 0
    mayo: float = 0
    junio: float = 0
    julio: float = 0
    agosto: float = 0
    septiembre: float = 0
    octubre: float = 0
    noviembre: float = 0
    diciembre: float = 0

    def from_db(plan_material_db: PlanMaterialDB) -> "PlanMaterialDTO":
        return PlanMaterialDTO(
            id=plan_material_db.id,
            año=plan_material_db.año,
            tipo_material=plan_material_db.tipo_material,
            total_pactados=plan_material_db.total_pactados,
            total_descontar=plan_material_db.total_descontar,
            enero=plan_material_db.enero,
            febrero=plan_material_db.febrero,
            marzo=plan_material_db.marzo,
            abril=plan_material_db.abril,
            mayo=plan_material_db.mayo,
            junio=plan_material_db.junio,
            julio=plan_material_db.julio,
            agosto=plan_material_db.agosto,
            septiembre=plan_material_db.septiembre,
            octubre=plan_material_db.octubre,
            noviembre=plan_material_db.noviembre,
            diciembre=plan_material_db.diciembre,
        )
    
    def to_db(self) -> PlanMaterialDB:
        return PlanMaterialDB(
            id=self.id,
            año=self.año,
            tipo_material=self.tipo_material,
            total_pactados=self.total_pactados,
            total_descontar=self.total_descontar,
            enero=self.enero,
            febrero=self.febrero,
            marzo=self.marzo,
            abril=self.abril,
            mayo=self.mayo,
            junio=self.junio,
            julio=self.julio,
            agosto=self.agosto,
            septiembre=self.septiembre,
            octubre=self.octubre,
            noviembre=self.noviembre,
            diciembre=self.diciembre,
        )
