# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB
#from rutas import CrudRoutes, ExtraRoutes
import uvicorn
import logging
from configurar_logs import configurar_logs

from persistencia import DB

configurar_logs()

logger = logging.getLogger("paezlobato_servidor")

logger.info("Aplicación iniciada")
logger.warning("Aviso: faltan datos de facturación")
logger.error("Error al conectar con MySQL", exc_info=True)

# Precarga de datos
cache_inicial = {}

app = FastAPI(title="Servidor FastAPI con CRUD + WebSocket", version="1.0.0")


@app.on_event("startup")
def cargar_datos_iniciales():
    with DB.crear_sesion() as session:
        cache_inicial["camiones"] = session.exec(select(PlanCamionesDB)).all()
        cache_inicial["facturacion"] = session.exec(select(PlanFacturacionDB)).all()
        cache_inicial["materiales"] = session.exec(select(PlanMaterialDB)).all()
    print("✅ Datos iniciales cargados")


# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#crud_routes = CrudRoutes.get_router()
#extra_routes = ExtraRoutes.get_router()
# Montar routers
#app.include_router(crud_routes.router)
#app.include_router(extra_routes.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
