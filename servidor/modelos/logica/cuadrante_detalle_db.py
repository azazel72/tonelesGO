from datetime import date
from typing import Optional

from sqlmodel import SQLModel, Field


class CuadranteDetalleDB(SQLModel, table=True):
    __tablename__ = "cuadrante_detalles"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date

    cuadrante_id: int = Field(
        index=True,
        foreign_key="cuadrante.id",
    )

    puesto_id: int = Field(
        index=True,
        foreign_key="puesto_trabajo.id",
    )

    usuario_id: int = Field(
        index=True,
        foreign_key="usuario.id",
    )

    orden_en_puesto: int = Field(default=1, ge=0)
