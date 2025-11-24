# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class PuestoTrabajoDB(SQLModel, table=True):
    __tablename__ = "puestos_trabajo"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: Optional[str] = None
