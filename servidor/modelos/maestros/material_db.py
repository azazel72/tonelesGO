
from sqlmodel import SQLModel, Field
from typing import Optional


class MaterialDB(SQLModel, table=True):
    __tablename__ = "materiales"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
