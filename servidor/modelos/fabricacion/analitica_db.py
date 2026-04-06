from datetime import date, datetime
from typing import Optional

from sqlalchemy import Column, DateTime, text
from sqlmodel import Field, SQLModel


class AnaliticaDB(SQLModel, table=True):
    __tablename__ = "analiticas"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: date
    descripcion: str
    estado: str = "ACTIVA"
    grado_alcoholico: str | None = None
    ph: str | None = None
    acidez_total: str | None = None
    acidez_volatil: str | None = None
    so2_libre: str | None = None
    so2_total: str | None = None
    azucar_residual: str | None = None
    temperatura: str | None = None
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")),
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime,
            nullable=False,
            server_default=text("CURRENT_TIMESTAMP"),
            server_onupdate=text("CURRENT_TIMESTAMP"),
        ),
    )
