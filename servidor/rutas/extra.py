# app/routes/extra_routes.py
from fastapi import APIRouter

class ExtraRoutes:

    @staticmethod
    def get_router():
        router = APIRouter(tags=["Extra"])

        @router.get("/object")
        async def get_object():
            return {
                "meta": {"version": "1.0"},
                "payload": {"mensaje": "Aquí devolveré el objeto que definas más adelante"}
            }

        return router
