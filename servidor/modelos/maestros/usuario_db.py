# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class UsuarioDB(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: Optional[str] = Field(default=None, max_length=2)
    alias: str
    nombre: Optional[str] = None
    rol_id: str
    empleado: Optional[bool] = Field(default=False)
    activo: Optional[bool] = Field(default=True)
    clave: str
