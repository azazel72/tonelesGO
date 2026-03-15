
from pydantic import BaseModel
from servidor.modelos import LineaEntradaDB


class LineaEntradaDTO(BaseModel):
    id: int | None
    entrada_id: int
    tipo_producto_id: int | None = None
    material_id: int | None = None
    bultos: int = 0
    kilos: float = 0
    bultos_entregados: int = 0
    verificado: bool = False

    def from_db(linea_db: LineaEntradaDB) -> "LineaEntradaDTO":
        return LineaEntradaDTO(
            id=linea_db.id,
            entrada_id=linea_db.entrada_id,
            tipo_producto_id=linea_db.tipo_producto_id,
            material_id=linea_db.material_id,
            bultos=linea_db.bultos,
            kilos=linea_db.kilos,
            bultos_entregados=linea_db.bultos_entregados,
            verificado=linea_db.verificado,
        )

    def to_db(self) -> LineaEntradaDB:
        return LineaEntradaDB(
            id=self.id,
            entrada_id=self.entrada_id,
            tipo_producto_id=self.tipo_producto_id,
            material_id=self.material_id,
            bultos=self.bultos,
            kilos=self.kilos,
            bultos_entregados=self.bultos_entregados,
            verificado=self.verificado,
        )
