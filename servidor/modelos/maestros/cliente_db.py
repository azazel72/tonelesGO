# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class ClienteDB(SQLModel, table=True):
    __tablename__ = "clientes"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str

