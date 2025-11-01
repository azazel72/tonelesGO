# app/main.py
from datetime import datetime
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .colector import Colector
from .dominio import DatosDTO

from .modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB
from .rutas import ExtraRoutes, CrudRoutes
import uvicorn
import logging
from .configurar_logs import configurar_logs
from .persistencia import DB

configurar_logs()

logger = logging.getLogger("paezlobato_servidor")

logger.info("Aplicación iniciada")

# Precarga de datos
datos = DatosDTO()
DatosDTO.datos = datos

colector = Colector()
Colector.colector = colector

@asynccontextmanager
async def lifespan(app: FastAPI):

    datos.datos_maestros = colector.obtener_datos_maestros()

    año_actual = datetime.now().year
    datos.entradas = colector.obtener_entradas(año_actual)

    print(datos)

    yield
    # --- código al apagar ---
    datos.clear()

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

if __name__ == "__main__":
    uvicorn.run("servidor.main:app", host="0.0.0.0", port=5000, reload=True)
