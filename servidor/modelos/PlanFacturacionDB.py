# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class PlanFacturacionDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
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

