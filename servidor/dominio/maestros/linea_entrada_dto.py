
from pydantic import BaseModel
from servidor.modelos import LineaEntradaDB


class LineaEntradaDTO(BaseModel):
    id: int | None
    entrada_id: int
    duela_id: int
    bultos: int = 0
    kilos: float = 0
    bultos_entregados: int = 0
    verificado: bool = False

    def from_db(linea_db: LineaEntradaDB) -> "LineaEntradaDTO":
        return LineaEntradaDTO(
            id=linea_db.id,
            entrada_id=linea_db.entrada_id,
            duela_id=linea_db.duela_id,
            bultos=linea_db.bultos,
            kilos=linea_db.kilos,
            bultos_entregados=linea_db.bultos_entregados,
            verificado=linea_db.verificado,
        )

    def to_db(self) -> LineaEntradaDB:
        return LineaEntradaDB(
            id=self.id,
            entrada_id=self.entrada_id,
            duela_id=self.duela_id,
            bultos=self.bultos,
            kilos=self.kilos,
            bultos_entregados=self.bultos_entregados,
            verificado=self.verificado,
        )
