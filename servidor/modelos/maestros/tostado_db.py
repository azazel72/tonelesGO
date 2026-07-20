from sqlmodel import SQLModel, Field
from typing import Optional


class TostadoDB(SQLModel, table=True):
    __tablename__ = "tostados"

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
