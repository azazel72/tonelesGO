from typing import Dict

from servidor.colector import Colector
from servidor.logica.login import cerrar_sesion, iniciar_sesion

def obtener_acciones() -> Dict[str, any]:
    return {
        "login": iniciar_sesion,
        "logout": cerrar_sesion,
        "maestros": lambda ws, req: Colector.colector.maestros,
        "cargar_entradas": lambda ws, req: Colector.colector.obtener_entradas(req.data.get("año")),
        "agregar_entradas_proveedores": lambda ws, req: Colector.colector.agregar_entradas_proveedores(req.data.get("año")),
    }
