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
    deposito: str | None = None
    litros: str | None = None
    alcohol: str | None = None
    av: str | None = None
    ph: str | None = None
    ntu: str | None = None
    azucar: str | None = None
    numero_botas: str | None = None
    cliente: str | None = None
    tipo_bota: str | None = None
    vo_at: str | None = None
    observaciones: str | None = None
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
