from pydantic import BaseModel
from servidor.modelos import PlanCamionDB

class PlanCamionDTO(BaseModel):
    id: int | None
    año: int
    proveedor_id: int

    total_pactados: int = 0
    total_descontar: int = 0

    ene_previsto: int = 0; ene_confirmado: int = 0
    feb_previsto: int = 0; feb_confirmado: int = 0
    mar_previsto: int = 0; mar_confirmado: int = 0
    abr_previsto: int = 0; abr_confirmado: int = 0
    may_previsto: int = 0; may_confirmado: int = 0
    jun_previsto: int = 0; jun_confirmado: int = 0
    jul_previsto: int = 0; jul_confirmado: int = 0
    ago_previsto: int = 0; ago_confirmado: int = 0
    sep_previsto: int = 0; sep_confirmado: int = 0
    oct_previsto: int = 0; oct_confirmado: int = 0
    nov_previsto: int = 0; nov_confirmado: int = 0
    dic_previsto: int = 0; dic_confirmado: int = 0

    def from_db(plan_camion_db: PlanCamionDB) -> "PlanCamionDTO":
        return PlanCamionDTO(
            id=plan_camion_db.id,
            año=plan_camion_db.año,
            proveedor_id=plan_camion_db.proveedor_id,
            total_pactados=plan_camion_db.total_pactados,
            total_descontar=plan_camion_db.total_descontar,
            ene_previsto=plan_camion_db.ene_previsto,
            ene_confirmado=plan_camion_db.ene_confirmado,
            feb_previsto=plan_camion_db.feb_previsto,
            feb_confirmado=plan_camion_db.feb_confirmado,
            mar_previsto=plan_camion_db.mar_previsto,
            mar_confirmado=plan_camion_db.mar_confirmado,
            abr_previsto=plan_camion_db.abr_previsto,
            abr_confirmado=plan_camion_db.abr_confirmado,
            may_previsto=plan_camion_db.may_previsto,
            may_confirmado=plan_camion_db.may_confirmado,
            jun_previsto=plan_camion_db.jun_previsto,
            jun_confirmado=plan_camion_db.jun_confirmado,
            jul_previsto=plan_camion_db.jul_previsto,
            jul_confirmado=plan_camion_db.jul_confirmado,
            ago_previsto=plan_camion_db.ago_previsto,
            ago_confirmado=plan_camion_db.ago_confirmado,
            sep_previsto=plan_camion_db.sep_previsto,
            sep_confirmado=plan_camion_db.sep_confirmado,
            oct_previsto=plan_camion_db.oct_previsto,
            oct_confirmado=plan_camion_db.oct_confirmado,
            nov_previsto=plan_camion_db.nov_previsto,
            nov_confirmado=plan_camion_db.nov_confirmado,
            dic_previsto=plan_camion_db.dic_previsto,
            dic_confirmado=plan_camion_db.dic_confirmado,
        )
    
    def to_db(self) -> PlanCamionDB:
        return PlanCamionDB(
            id=self.id,
            año=self.año,
            proveedor_id=self.proveedor_id,
            total_pactados=self.total_pactados,
            total_descontar=self.total_descontar,
            ene_previsto=self.ene_previsto,
            ene_confirmado=self.ene_confirmado,
            feb_previsto=self.feb_previsto,
            feb_confirmado=self.feb_confirmado,
            mar_previsto=self.mar_previsto,
            mar_confirmado=self.mar_confirmado,
            abr_previsto=self.abr_previsto,
            abr_confirmado=self.abr_confirmado,
            may_previsto=self.may_previsto,
            may_confirmado=self.may_confirmado,
            jun_previsto=self.jun_previsto,
            jun_confirmado=self.jun_confirmado,
            jul_previsto=self.jul_previsto,
            jul_confirmado=self.jul_confirmado,
            ago_previsto=self.ago_previsto,
            ago_confirmado=self.ago_confirmado,
            sep_previsto=self.sep_previsto,
            sep_confirmado=self.sep_confirmado,
            oct_previsto=self.oct_previsto,
            oct_confirmado=self.oct_confirmado,
            nov_previsto=self.nov_previsto,
            nov_confirmado=self.nov_confirmado,
            dic_previsto=self.dic_previsto,
            dic_confirmado=self.dic_confirmado,
        )
