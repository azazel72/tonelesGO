# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class RolDB(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    planificacion: bool
    recepcion: bool
    ubicacion: bool
    fabricacion: bool
    expedicion: bool
    trazabilidad: bool
    administrador: bool
    