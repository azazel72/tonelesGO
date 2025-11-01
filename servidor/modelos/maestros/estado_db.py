# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class EstadoDB(SQLModel, table=True):
    __tablename__ = "estados"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
