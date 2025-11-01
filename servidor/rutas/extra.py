# app/routes/extra_routes.py
from fastapi import APIRouter
from servidor.dominio.DatosDTO import DatosDTO

class ExtraRoutes:

    @staticmethod
    def get_router():
        router = APIRouter(tags=["Extra"])

        @router.get("/object", response_model=DatosDTO)
        async def get_object():
            return DatosDTO.datos

        return router
