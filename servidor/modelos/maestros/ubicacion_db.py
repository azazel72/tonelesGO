# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class UbicacionDB(SQLModel, table=True):
    __tablename__ = "ubicaciones"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
    instalacion_id: int
    orden: Optional[int] = 0
