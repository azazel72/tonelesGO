
from pydantic import BaseModel
from servidor.modelos import ArchivoSubidoDB


class ArchivoSubidoDTO(BaseModel):
    id: int | None
    titulo: str
    nombre_original: str
    nombre_archivo: str
    extension: str
    entidad: str
    entidad_id: int

    def from_db(archivo_db: ArchivoSubidoDB) -> "ArchivoSubidoDTO":
        return ArchivoSubidoDTO(
            id=archivo_db.id,
            titulo=archivo_db.titulo,
            nombre_original=archivo_db.nombre_original,
            nombre_archivo=archivo_db.nombre_archivo,
            extension=archivo_db.extension,
            entidad=archivo_db.entidad,
            entidad_id=archivo_db.entidad_id,
        )

    def to_db(self) -> ArchivoSubidoDB:
        return ArchivoSubidoDB(
            id=self.id,
            titulo=self.titulo,
            nombre_original=self.nombre_original,
            nombre_archivo=self.nombre_archivo,
            extension=self.extension,
            entidad=self.entidad,
            entidad_id=self.entidad_id,
        )
