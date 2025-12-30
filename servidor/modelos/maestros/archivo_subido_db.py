
from sqlmodel import SQLModel, Field
from typing import Optional


class ArchivoSubidoDB(SQLModel, table=True):
    __tablename__ = "archivos_subidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    nombre_original: str
    nombre_archivo: str
    extension: str
    entidad: str
    entidad_id: int
