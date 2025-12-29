from typing import Dict

from servidor.colector import Colector
from servidor.logica.login import cerrar_sesion, iniciar_sesion

def obtener_acciones() -> Dict[str, any]:
    return {
        "login": iniciar_sesion,
        "logout": cerrar_sesion,
        "maestros": lambda ws, req: Colector.colector.maestros,
        "cargar_configuracion_entradas": lambda ws, req: Colector.colector.obtener_configuracion_entradas(req.data.get("año")),
        "agregar_configuracion_entradas": lambda ws, req: Colector.colector.agregar_configuracion_entradas(req.data.get("año")),
        "modificar_maestro": lambda ws, req: Colector.colector.modificar_maestro(req.data),
        "modificar_entrada": lambda ws, req: Colector.colector.modificar_entrada(req.data),
        "eliminar_maestro": lambda ws, req: Colector.colector.eliminar_maestro(req.data),
        "insertar_maestro": lambda ws, req: Colector.colector.insertar_maestro(req.data),
        "cargar_cuadrantes": lambda ws, req: Colector.colector.obtener_cuadrante(req.data.get("fecha")),
        "actualizar_detalle_cuadrante": lambda ws, req: Colector.colector.actualizar_detalle_cuadrante(req.data),
        "insertar_detalle_cuadrante": lambda ws, req: Colector.colector.insertar_detalle_cuadrante(req.data),
        "eliminar_detalle_cuadrante": lambda ws, req: Colector.colector.eliminar_detalle_cuadrante(req.data),
    }
