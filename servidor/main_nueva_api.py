from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from servidor.colector import Colector
from servidor.conexiones.nueva_api_routes import NuevaApiRoutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        colector = Colector()
        colector.obtener_datos_maestros()
        yield
    except Exception:
        raise


app = FastAPI(
    lifespan=lifespan,
    title="Servidor FastAPI - Nueva API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(NuevaApiRoutes.get_router())
