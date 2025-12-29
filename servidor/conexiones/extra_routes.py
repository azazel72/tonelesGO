# app/routes/extra_routes.py
from typing import Dict, List
from fastapi import APIRouter
from servidor.colector import Colector
from servidor.dominio.logica.planificacion_entradas_dto import PlanificacionEntradasDTO
from servidor.dominio.logica.maestros_dto import MaestrosDTO
from servidor.dominio.maestros.cliente_dto import ClienteDTO

class ExtraRoutes:

    @staticmethod
    def get_router():
        router = APIRouter(tags=["Extra"])

        @router.get("/maestros", response_model=MaestrosDTO)
        async def get_maestros():
            colector = Colector.colector
            return colector.maestros

        @router.get("/planificacion-entradas", response_model=str)
        async def get_planificacion_entradas():
            return str(Colector.colector.planificacion_entradas)


        return router
