from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class BotaEnvinadaAnaliticaDB(SQLModel, table=True):
    __tablename__ = "bota_envinada_analitica"

    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int
    analitica_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
