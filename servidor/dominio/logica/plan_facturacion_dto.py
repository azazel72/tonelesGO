from pydantic import BaseModel
from typing import List, Optional
from servidor.modelos import PlanFacturacionDB

class PlanFacturacionDTO(BaseModel):
    id: int | None
    año: int
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

    def from_db(plan_facturacion_db: PlanFacturacionDB) -> "PlanFacturacionDTO":
        return PlanFacturacionDTO(
            id=plan_facturacion_db.id,
            año=plan_facturacion_db.año,
            enero=plan_facturacion_db.enero,
            febrero=plan_facturacion_db.febrero,
            marzo=plan_facturacion_db.marzo,
            abril=plan_facturacion_db.abril,
            mayo=plan_facturacion_db.mayo,
            junio=plan_facturacion_db.junio,
            julio=plan_facturacion_db.julio,
            agosto=plan_facturacion_db.agosto,
            septiembre=plan_facturacion_db.septiembre,
            octubre=plan_facturacion_db.octubre,
            noviembre=plan_facturacion_db.noviembre,
            diciembre=plan_facturacion_db.diciembre,
        )
    
    def to_db(self) -> PlanFacturacionDB:
        return PlanFacturacionDB(
            id=self.id,
            año=self.año,
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
