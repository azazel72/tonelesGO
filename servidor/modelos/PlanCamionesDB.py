# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class PlanCamionesDB(SQLModel, table=True):
    __tablename__ = "plan_camiones"

    id: Optional[int] = Field(default=None, primary_key=True)
    año: int
    proveedor_id: str

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