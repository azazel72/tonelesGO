from .modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB
from .persistencia import GenericRepository, DB
from .dominio import EntradasDTO


class Colector:

    colector: "Colector" = None

    def __init__(self):
        self.repo_facturacion = GenericRepository(PlanFacturacionDB)
        self.repo_camiones = GenericRepository(PlanCamionesDB)
        self.repo_materiales = GenericRepository(PlanMaterialDB)

    def obtener_datos_maestros(self) -> dict:
        with DB.crear_sesion() as session:
            camiones = self.repo_camiones.list_all(session)
            facturacion = self.repo_facturacion.list_all(session)
            materiales = self.repo_materiales.list_all(session)

            return {
                "camiones": camiones,
                "facturacion": facturacion,
                "materiales": materiales
            }

    def obtener_entradas(self, año: int) -> EntradasDTO:
        with DB.crear_sesion() as session:
            plan_camiones = self.repo_camiones.list_by_year(session, año)
            plan_facturacion = self.repo_facturacion.list_by_year(session, año)
            plan_materiales = self.repo_materiales.list_by_year(session, año)

            return EntradasDTO(
                año=año,
                plan_camiones=plan_camiones,
                plan_facturacion=plan_facturacion[0] if plan_facturacion else None,
                plan_materiales=plan_materiales
            )

