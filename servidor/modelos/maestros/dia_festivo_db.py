from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field


class DiaFestivoDB(SQLModel, table=True):
    __tablename__ = "dias_festivos"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date
