from typing import Dict

from servidor.colector import Colector
from servidor.logica.login import cerrar_sesion, iniciar_sesion

def obtener_acciones() -> Dict[str, any]:
    return {
        "login": iniciar_sesion,
        "logout": cerrar_sesion,
        "maestros": lambda ws, req: Colector.colector.maestros,
        "fabricacion": lambda ws, req: Colector.colector.obtener_fabricacion(),
        "cargar_planificacion_entradas": lambda ws, req: Colector.colector.obtener_planificacion_entradas(req.data.get("año")),
        "agregar_planificacion_entradas": lambda ws, req: Colector.colector.agregar_planificacion_entradas(req.data.get("año")),
        "listar_entradas_planificacion": lambda ws, req: Colector.colector.listar_entradas_planificacion(req.data.get("año"), req.data.get("proveedor_id")),
        "listar_lineas_entrada": lambda ws, req: Colector.colector.listar_lineas_entrada(req.data.get("entrada_id")),
        "listar_pedidos": lambda ws, req: Colector.colector.listar_pedidos(req.data.get("año")),
        "listar_fabricacion_semanal": lambda ws, req: Colector.colector.listar_fabricacion_semanal(req.data.get("pedido_id")),
        "listar_trazabilidad_fabricacion": lambda ws, req: Colector.colector.listar_trazabilidad_fabricacion(req.data.get("fabricacion_semanal_id")),
        "listar_palets_consumo": lambda ws, req: Colector.colector.listar_palets_consumo(),
        "agregar_trazabilidad_fabricacion": lambda ws, req: Colector.colector.agregar_trazabilidad_fabricacion(req.data),
        "eliminar_trazabilidad_fabricacion": lambda ws, req: Colector.colector.eliminar_trazabilidad_fabricacion(req.data),
        "actualizar_estado_trazabilidad_fabricacion": lambda ws, req: Colector.colector.actualizar_estado_trazabilidad_fabricacion(req.data),
        "imprimir_etiqueta_fabricacion": lambda ws, req: Colector.colector.imprimir_etiqueta_fabricacion(req.data, ws),
        "listar_operarios_planificacion_fabricacion": lambda ws, req: Colector.colector.listar_operarios_planificacion_fabricacion(req.data or {}),
        "listar_archivos_entidad": lambda ws, req: Colector.colector.listar_archivos_entidad(req.data.get("entidad"), req.data.get("entidad_id")),
        "inventario_duelas": lambda ws, req: Colector.colector.inventario_duelas(),
        "inventario_flejes": lambda ws, req: Colector.colector.inventario_flejes(),
        "siguiente_codigo_palet": lambda ws, req: Colector.colector.siguiente_codigo_palet(req.data or {}),
        "modificar_maestro": lambda ws, req: Colector.colector.modificar_maestro(req.data),
        "modificar_entrada": lambda ws, req: Colector.colector.modificar_entrada(req.data),
        "eliminar_maestro": lambda ws, req: Colector.colector.eliminar_maestro(req.data),
        "insertar_maestro": lambda ws, req: Colector.colector.insertar_maestro(req.data),
        "cargar_cuadrantes": lambda ws, req: Colector.colector.obtener_cuadrante(req.data.get("fecha")),
        "clonar_columna_cuadrante": lambda ws, req: Colector.colector.clonar_columna_cuadrante(req.data),
        "actualizar_detalle_cuadrante": lambda ws, req: Colector.colector.actualizar_detalle_cuadrante(req.data),
        "insertar_detalle_cuadrante": lambda ws, req: Colector.colector.insertar_detalle_cuadrante(req.data),
        "eliminar_detalle_cuadrante": lambda ws, req: Colector.colector.eliminar_detalle_cuadrante(req.data),
    }
