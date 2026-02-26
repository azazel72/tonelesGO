from sqlmodel import SQLModel, Field
from typing import Optional


class ConsumoDB(SQLModel, table=True):
    __tablename__ = "consumos"

    id: Optional[int] = Field(default=None, primary_key=True)
    bota_id: int
    consumible_id: int
    consumo: float = 0.0
