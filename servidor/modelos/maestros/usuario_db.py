# models_db.py
from sqlmodel import SQLModel, Field
from typing import Optional

class UsuarioDB(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    fullname: str
    rol: str
