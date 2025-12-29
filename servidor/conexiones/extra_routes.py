# app/routes/extra_routes.py
from typing import Dict, List
from fastapi import APIRouter
from servidor.colector import Colector
from servidor.dominio.logica.configuracion_entradas_dto import ConfiguracionEntradasDTO
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

        @router.get("/configuracion-entradas", response_model=str)
        async def get_configuracion_entradas():
            return str(Colector.colector.configuracion_entradas)


        return router
