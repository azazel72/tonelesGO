# app/main.py
from datetime import datetime
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from servidor.conexiones.sesiones import Sesiones

from .colector import Colector

from .conexiones import ExtraRoutes, CrudRoutes
import logging
from .configurar_logs import configurar_logs

configurar_logs()

logger = logging.getLogger("paezlobato_servidor")

logger.info("Aplicación iniciada")

# Precarga de datos
colector = Colector()

@asynccontextmanager
async def lifespan(app: FastAPI):
    #año_actual = datetime.now().year
    try:
        colector = Colector()
        colector.obtener_datos_maestros()  # puede fallar
        yield
    except Exception:
        logger.exception("Fallo al inicializar datos maestros")
        raise  # re-lanza para que falle UNA vez

app = FastAPI(lifespan=lifespan, title="Servidor FastAPI con CRUD + WebSocket", version="1.0.0")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

crud_routes = CrudRoutes.get_router()
extra_routes = ExtraRoutes.get_router()
# Montar routers
app.include_router(crud_routes)
app.include_router(extra_routes)
logger.info("Rutas montadas correctamente")