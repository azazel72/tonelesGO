# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class InstalacionDB(SQLModel, table=True):
    __tablename__ = "instalaciones"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    tipo: Optional[str] = None
