from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class BotaEnvinadaArchivoDB(SQLModel, table=True):
    __tablename__ = "bota_envinada_archivo"

    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int
    archivo_subido_id: int
    created_at: Optional[datetime] = None
