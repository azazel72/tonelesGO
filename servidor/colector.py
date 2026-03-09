from datetime import date, timedelta
import re
import logging
import threading
from typing import List, get_args
from sqlmodel import Session

from servidor.herramientas.utilidades import obtener_anterior_dia_semana
from servidor.herramientas.BcryptHelper import BcryptHelper

from .modelos import ClienteDB, EstadoPedidoDB, EstadoFabricacionSemanalDB, EstadoBotaDB, EstadoTrazabilidadFabricacionDB, EstadoPaletDB
from .modelos import InstalacionDB, UbicacionDB, ProveedorDB, UsuarioDB, RolDB, PuestoTrabajoDB, MaterialDB, DuelaDB, EntradaDB, LineaEntradaDB, PaletDB, ProductoDB, ProductoOperarioDB, ArchivoSubidoDB, AmbienteDB, EntradaFlejeDB, StockDB, CubicajeDB
from .modelos import PedidoDB, TipoProductoDB, FabricacionSemanalDB, TrazabilidadProcesadoDB, TrazabilidadFabricacionDB, TrazabilidadProductoDB, BotaDB, ConsumoDB
from .modelos import PlanCamionDB, PlanFacturacionDB, PlanMaterialDB, CuadranteDB, CuadranteDetalleDB
from .persistencia import GenericRepository, DB
from sqlmodel import select
from sqlalchemy import extract, func
from .dominio import PlanificacionEntradasDTO, MaestrosDTO, PlanMaterialDTO, PlanFacturacionDTO, PlanCamionDTO, CuadranteDTO, CuadranteDetalleDTO, FabricacionDTO
from .dominio import ClienteDTO, EstadoPedidoDTO, EstadoFabricacionSemanalDTO, EstadoBotaDTO, EstadoTrazabilidadFabricacionDTO, EstadoPaletDTO, InstalacionDTO, UbicacionDTO, ProveedorDTO, UsuarioDTO, RolDTO, PuestoTrabajoDTO, MaterialDTO, DuelaDTO, EntradaDTO, LineaEntradaDTO, PaletDTO, ProductoDTO, ArchivoSubidoDTO, AmbienteDTO, EntradaFlejeDTO, StockDTO, CubicajeDTO, CuadrantesDTO
from .dominio import PedidoDTO, TipoProductoDTO, FabricacionSemanalDTO, TrazabilidadProcesadoDTO, TrazabilidadFabricacionDTO, TrazabilidadProductoDTO, BotaDTO, ConsumoDTO
from servidor.impresion import ImprimirEtiqueta
from servidor.conexiones.broadcast import broadcast_error, broadcast_event

logger = logging.getLogger("paezlobato_colector")

class Colector:

    colector: "Colector" = None
    planificacion_entradas: "PlanificacionEntradasDTO" = None
    maestros: "MaestrosDTO" = None
    cuadrantes: "CuadrantesDTO" = None
    fabricacion: "FabricacionDTO" = None


    def __init__(self):
        Colector.colector = self
        self.planificacion_entradas = PlanificacionEntradasDTO()
        self.maestros = MaestrosDTO()
        self.cuadrantes = CuadrantesDTO()
        self.fabricacion = FabricacionDTO()

        self.repo_facturacion = GenericRepository(PlanFacturacionDB)
        self.repo_camiones = GenericRepository(PlanCamionDB)
        self.repo_materiales = GenericRepository(PlanMaterialDB)

        self.repo_clientes = GenericRepository(ClienteDB)
        self.repo_estados_pedidos = GenericRepository(EstadoPedidoDB)
        self.repo_estados_fabricacion_semanal = GenericRepository(EstadoFabricacionSemanalDB)
        self.repo_estados_botas = GenericRepository(EstadoBotaDB)
        self.repo_estados_trazabilidad_fabricacion = GenericRepository(EstadoTrazabilidadFabricacionDB)
        self.repo_estados_palets = GenericRepository(EstadoPaletDB)
        self.repo_instalaciones = GenericRepository(InstalacionDB)
        self.repo_ubicaciones = GenericRepository(UbicacionDB)
        self.repo_proveedores = GenericRepository(ProveedorDB)
        self.repo_puestos_trabajo = GenericRepository(PuestoTrabajoDB)

        self.repo_materiales_maestro = GenericRepository(MaterialDB)
        self.repo_duelas = GenericRepository(DuelaDB)
        self.repo_entradas = GenericRepository(EntradaDB)
        self.repo_lineas_entrada = GenericRepository(LineaEntradaDB)
        self.repo_palets = GenericRepository(PaletDB)
        self.repo_productos = GenericRepository(ProductoDB)
        self.repo_archivos_subidos = GenericRepository(ArchivoSubidoDB)
        self.repo_ambientes = GenericRepository(AmbienteDB)
        self.repo_entradas_flejes = GenericRepository(EntradaFlejeDB)
        self.repo_stocks = GenericRepository(StockDB)
        self.repo_cubicaje = GenericRepository(CubicajeDB)
        self.repo_pedidos = GenericRepository(PedidoDB)
        self.repo_tipos_producto = GenericRepository(TipoProductoDB)
        self.repo_fabricacion_semanal = GenericRepository(FabricacionSemanalDB)
        self.repo_trazabilidad_procesado = GenericRepository(TrazabilidadProcesadoDB)
        self.repo_trazabilidad_fabricacion = GenericRepository(TrazabilidadFabricacionDB)
        self.repo_trazabilidad_producto = GenericRepository(TrazabilidadProductoDB)
        self.repo_botas = GenericRepository(BotaDB)
        self.repo_consumos = GenericRepository(ConsumoDB)

        self.repo_usuarios = GenericRepository(UsuarioDB)
        self.repo_roles = GenericRepository(RolDB)

        self.repo_cuadrantes = GenericRepository(CuadranteDB)
        self.repo_cuadrante_detalles = GenericRepository(CuadranteDetalleDB)

    #region Métodos Maestros


    def obtener_datos_maestros(self) -> dict:
        with DB.crear_sesion() as session:
            clientes = self.repo_clientes.list_all(session)
            estados_pedidos = self.repo_estados_pedidos.list_all(session)
            estados_fabricacion_semanal = self.repo_estados_fabricacion_semanal.list_all(session)
            estados_botas = self.repo_estados_botas.list_all(session)
            estados_trazabilidad_fabricacion = self.repo_estados_trazabilidad_fabricacion.list_all(session)
            estados_palets = self.repo_estados_palets.list_all(session)
            instalaciones = self.repo_instalaciones.list_all(session)
            ubicaciones = self.repo_ubicaciones.list_all(session)
            proveedores = self.repo_proveedores.list_all(session)
            usuarios = self.repo_usuarios.list_all(session)
            roles = self.repo_roles.list_all(session)
            puestos_trabajo = self.repo_puestos_trabajo.list_all(session)
            materiales = self.repo_materiales_maestro.list_all(session)
            duelas = self.repo_duelas.list_all(session)
            entradas = self.repo_entradas.list_all(session)
            lineas_entrada = self.repo_lineas_entrada.list_all(session)
            palets = self.repo_palets.list_all(session)
            productos = self.repo_productos.list_all(session)
            archivos_subidos = self.repo_archivos_subidos.list_all(session)
            ambientes = self.repo_ambientes.list_all(session)
            entradas_flejes = self.repo_entradas_flejes.list_all(session)
            stocks = self.repo_stocks.list_all(session)
            cubicajes = self.repo_cubicaje.list_all(session)

            self.maestros.clientes = {cliente.id: ClienteDTO.from_db(cliente) for cliente in clientes}
            self.maestros.estados_pedidos = {estado.id: EstadoPedidoDTO.from_db(estado) for estado in estados_pedidos}
            self.maestros.estados_fabricacion_semanal = {estado.id: EstadoFabricacionSemanalDTO.from_db(estado) for estado in estados_fabricacion_semanal}
            self.maestros.estados_botas = {estado.id: EstadoBotaDTO.from_db(estado) for estado in estados_botas}
            self.maestros.estados_trazabilidad_fabricacion = {estado.id: EstadoTrazabilidadFabricacionDTO.from_db(estado) for estado in estados_trazabilidad_fabricacion}
            self.maestros.estados_palets = {estado.id: EstadoPaletDTO.from_db(estado) for estado in estados_palets}
            self.maestros.instalaciones = {instalacion.id: InstalacionDTO.from_db(instalacion) for instalacion in instalaciones}
            self.maestros.ubicaciones = {ubicacion.id: UbicacionDTO.from_db(ubicacion) for ubicacion in ubicaciones}
            self.maestros.proveedores = {proveedor.id: ProveedorDTO.from_db(proveedor) for proveedor in proveedores}
            self.maestros.usuarios = {usuario.id: UsuarioDTO.from_db(usuario) for usuario in usuarios}
            self.maestros.roles = {rol.id: RolDTO.from_db(rol) for rol in roles}
            self.maestros.puestos_trabajo = {puesto.id: PuestoTrabajoDTO.from_db(puesto) for puesto in puestos_trabajo}
            self.maestros.materiales = {material.id: MaterialDTO.from_db(material) for material in materiales}
            self.maestros.duelas = {duela.id: DuelaDTO.from_db(duela) for duela in duelas}
            self.maestros.entradas = {entrada.id: EntradaDTO.from_db(entrada) for entrada in entradas}
            self.maestros.lineas_entrada = {linea.id: LineaEntradaDTO.from_db(linea) for linea in lineas_entrada}
            self.maestros.palets = {palet.id: PaletDTO.from_db(palet) for palet in palets}
            self.maestros.productos = {producto.id: ProductoDTO.from_db(producto) for producto in productos}
            self.maestros.archivos_subidos = {archivo.id: ArchivoSubidoDTO.from_db(archivo) for archivo in archivos_subidos}
            self.maestros.ambientes = {ambiente.id: AmbienteDTO.from_db(ambiente) for ambiente in ambientes}
            self.maestros.entradas_flejes = {entrada.id: EntradaFlejeDTO.from_db(entrada) for entrada in entradas_flejes}
            self.maestros.stocks = {stock.id: StockDTO.from_db(stock) for stock in stocks}
            self.maestros.cubicaje = {cubicaje.id: CubicajeDTO.from_db(cubicaje) for cubicaje in cubicajes}

            #print("Datos maestros cargados:", self.maestros)
            #print("Datos clientes cargados:", self.maestros.clientes)

    def obtener_fabricacion(self) -> FabricacionDTO:
        with DB.crear_sesion() as session:
            ordenes = self.repo_pedidos.list_all(session)
            tipos = self.repo_tipos_producto.list_all(session)
            lineas = self.repo_fabricacion_semanal.list_all(session)
            traz_procesado = self.repo_trazabilidad_procesado.list_all(session)
            traz_fabricacion = self.repo_trazabilidad_fabricacion.list_all(session)
            traz_producto = self.repo_trazabilidad_producto.list_all(session)
            botas = self.repo_botas.list_all(session)
            consumos = self.repo_consumos.list_all(session)

            self.fabricacion.pedidos = {
                orden.id: PedidoDTO.from_db(orden) for orden in ordenes
            }
            self.fabricacion.tipos_producto = {
                tipo.id: TipoProductoDTO.from_db(tipo) for tipo in tipos
            }
            self.fabricacion.fabricacion_semanal = {
                linea.id: FabricacionSemanalDTO.from_db(linea) for linea in lineas
            }
            self.fabricacion.trazabilidad_procesado = {
                traz.id: TrazabilidadProcesadoDTO.from_db(traz) for traz in traz_procesado
            }
            self.fabricacion.trazabilidad_fabricacion = {
                traz.id: TrazabilidadFabricacionDTO.from_db(traz) for traz in traz_fabricacion
            }
            self.fabricacion.trazabilidad_producto = {
                traz.id: TrazabilidadProductoDTO.from_db(traz) for traz in traz_producto
            }
            self.fabricacion.botas = {
                bota.id: BotaDTO.from_db(bota) for bota in botas
            }
            self.fabricacion.consumos = {
                consumo.id: ConsumoDTO.from_db(consumo) for consumo in consumos
            }

            return self.fabricacion


    def modificar_maestro(self, data):
        tabla = data.get("tabla")
        entrada_id = data.get("id")
        campo = data.get("campo")
        valor = data.get("valor")
        objeto = None

        with DB.crear_sesion() as session:
            repo, maestro, objeto = self.obtener_repo(tabla)
            
            DTO = maestro.get(entrada_id)
            self.checkUpdate(DTO, tabla, entrada_id, campo)
            if tabla == "usuarios":
                if campo == "codigo":
                    valor = str(valor or "").strip()[:2]
                if campo == "clave":
                    valor = BcryptHelper.hash_password(valor or "")
            valor = self._normalizar_vacio_numerico(objeto, campo, valor)
            setattr(DTO, campo, valor)
            if tabla == "entradas_flejes":
                DTO.restante = max(float(DTO.peso or 0) - float(DTO.consumido or 0), 0.0)
            if hasattr(DTO, "bind_db_model"):
                DTO.bind_db_model(repo.model)
            updated = DTO.to_db()
            repo.update(session, updated)

            maestro[entrada_id] = DTO
            valor_respuesta = "" if (tabla == "usuarios" and campo == "clave") else valor
            valor_log = "<oculto>" if (tabla == "usuarios" and campo == "clave") else valor
            logger.info(f"Entrada ID {entrada_id} modificada: {campo} = {valor_log}")
            return  {"id": entrada_id, "campo": campo, "valor": valor_respuesta}


    def eliminar_maestro(self, data):
        tabla = data.get("tabla")
        entrada_id = data.get("id")

        with DB.crear_sesion() as session:
            repo, maestro, objeto = self.obtener_repo(tabla)
            repo.delete(session, entrada_id)
            try:
                session.commit()
            except Exception:
                session.rollback()
                raise

            #Actualizado en memoria
            maestro.pop(entrada_id, None)
            logger.info(f"Entrada ID {entrada_id} eliminada.")
            return {"id": entrada_id }



    def insertar_maestro(self, data):
        tabla = data.get("tabla")
        objeto = None

        with DB.crear_sesion() as session:
            repo, maestro, objeto = self.obtener_repo(tabla)
            data = self._normalizar_data_vacia_numerica(objeto, data)
            if tabla == "usuarios":
                data = dict(data or {})
                data["alias"] = data.get("alias")
                data["nombre"] = data.get("nombre")
                data["codigo"] = data.get("codigo")[:2] or None
                data["rol_id"] = int(data.get("rol_id") or self.maestros.obtener_rol_id_por_defecto())
                clave_plana = str(data.get("clave") or "")
                if clave_plana.strip() == "":
                    raise ValueError("La clave es obligatoria.")
                data["clave"] = BcryptHelper.hash_password(clave_plana)
                data["empleado"] = bool(data.get("empleado", False))

            objeto_DTO = objeto(id=0, **data)
            if tabla == "entradas_flejes":
                objeto_DTO.restante = max(float(objeto_DTO.peso or 0) - float(objeto_DTO.consumido or 0), 0.0)
            if hasattr(objeto_DTO, "bind_db_model"):
                objeto_DTO.bind_db_model(repo.model)
            objeto_DB = objeto_DTO.to_db()
            objeto_DB.id = None  # Asegura que el ID sea None para la inserción
            new = repo.insert(session, objeto_DB)
            objeto_DTO = objeto.from_db(new)
            maestro[new.id] = objeto_DTO

            logger.info(f"Insertado ID {new.id} en la tabla {tabla}")

            if tabla == "usuarios":
                return objeto_DTO.model_copy(update={"clave": ""})
            return objeto_DTO
    #endregion

    #region Métodos Entradas
    def obtener_planificacion_entradas(self, año: int, actualizar_local = True) -> PlanificacionEntradasDTO:
        with DB.crear_sesion() as session:
            plan_camiones = self.repo_camiones.list_by_year(session, año)
            plan_facturacion = self.repo_facturacion.list_by_year(session, año)
            plan_materiales = self.repo_materiales.list_by_year(session, año)

            planificacion_entradas_dto = PlanificacionEntradasDTO(
                año=año,
                plan_camiones=[PlanCamionDTO.from_db(pc) for pc in plan_camiones],
                plan_facturacion=PlanFacturacionDTO.from_db(plan_facturacion[0]) if plan_facturacion else None,
                plan_materiales=[PlanMaterialDTO.from_db(pm) for pm in plan_materiales]
            )
        
            if actualizar_local:
                self.planificacion_entradas = planificacion_entradas_dto

            return planificacion_entradas_dto
        
    def agregar_planificacion_entradas(self, año: int) -> PlanificacionEntradasDTO:
        with DB.crear_sesion() as session:
            plan_camiones = self.repo_camiones.list_by_year(session, año)
            proveedores = self.repo_proveedores.list_all(session)

            plan_proveedores_ids = {pc.proveedor_id for pc in plan_camiones if pc.proveedor_id is not None}
            proveedores_faltantes = [p for p in proveedores if p.id not in plan_proveedores_ids]

            logger.info(f"Proveedores faltantes para el año {año}: {[p.nombre for p in proveedores_faltantes]}")
            nuevas = [PlanCamionDB(proveedor_id=p.id, año=año) for p in proveedores_faltantes]
            self.repo_camiones.insert_all(session, nuevas)
            try:
                session.commit()
            except Exception:
                session.rollback()
                raise
            logger.info("Entradas de proveedores agregadas correctamente.")
            return self.obtener_planificacion_entradas(año)

    def modificar_entrada(self, data):
        tabla = data.get("tabla")
        entrada_id = data.get("id")
        campo = data.get("campo")
        valor = data.get("valor")
        objeto = None

        with DB.crear_sesion() as session:
            repo, busqueda, objeto = self.obtener_repo(tabla)

            DTO = busqueda(entrada_id)
            self.checkUpdate(DTO, tabla, entrada_id, campo)  

            valor = self._normalizar_vacio_numerico(objeto, campo, valor)
            setattr(DTO, campo, valor)
            updated = DTO.to_db()
            repo.update(session, updated)

            logger.info(f"Entrada ID {entrada_id} modificada: {campo} = {valor}")
            return {"id": entrada_id, "campo": campo, "valor": valor}
    #endregion

    #region Mètodos Listados Entradas
    def listar_entradas_planificacion(self, año: int, proveedor_id: int | None):
        with DB.crear_sesion() as session:
            statement = select(EntradaDB)
            if proveedor_id:
                statement = statement.where(EntradaDB.proveedor_id == proveedor_id)
            if año:
                statement = statement.where(extract("year", EntradaDB.fecha) == año)
            entradas = session.exec(statement).all()
            return [EntradaDTO.from_db(entrada) for entrada in entradas]

    def listar_lineas_entrada(self, entrada_id: int):
        with DB.crear_sesion() as session:
            statement = select(LineaEntradaDB).where(LineaEntradaDB.entrada_id == entrada_id)
            lineas = session.exec(statement).all()
            return [LineaEntradaDTO.from_db(linea) for linea in lineas]

    def listar_archivos_entidad(self, entidad: str, entidad_id: int):
        with DB.crear_sesion() as session:
            statement = select(ArchivoSubidoDB).where(
                ArchivoSubidoDB.entidad == entidad,
                ArchivoSubidoDB.entidad_id == entidad_id,
                ArchivoSubidoDB.is_deleted == False,
            )
            archivos = session.exec(statement).all()
            return [ArchivoSubidoDTO.from_db(archivo) for archivo in archivos]
    #endregion

    #region Metodos Listados Fabricacion
    def listar_pedidos(self, año: int | None = None):
        with DB.crear_sesion() as session:
            statement = select(PedidoDB)
            if año:
                statement = statement.where(extract("year", PedidoDB.fecha) == año)
            ordenes = session.exec(statement).all()
            return [PedidoDTO.from_db(orden) for orden in ordenes]

    def listar_fabricacion_semanal(self, pedido_id: int):
        with DB.crear_sesion() as session:
            statement = select(FabricacionSemanalDB).where(FabricacionSemanalDB.pedido_id == pedido_id)
            lineas = session.exec(statement).all()
            return [FabricacionSemanalDTO.from_db(linea) for linea in lineas]

    def listar_trazabilidad_fabricacion(self, fabricacion_semanal_id: int):
        with DB.crear_sesion() as session:
            statement = select(TrazabilidadFabricacionDB).where(
                TrazabilidadFabricacionDB.fabricacion_semanal_id == fabricacion_semanal_id
            )
            trazas = session.exec(statement).all()
            palet_ids = {t.palet_id for t in trazas if t.palet_id}
            palet_map = {}
            if palet_ids:
                palets = session.exec(select(PaletDB).where(PaletDB.id.in_(palet_ids))).all()
                palet_map = {p.id: p.codigo for p in palets}
            return [
                {
                    "id": t.id,
                    "fabricacion_semanal_id": t.fabricacion_semanal_id,
                    "palet_id": t.palet_id,
                    "palet_codigo": palet_map.get(t.palet_id),
                    "cantidad_fabricada": t.cantidad_fabricada,
                    "estado": t.estado,
                }
                for t in trazas
            ]

    def listar_palets_consumo(self):
        with DB.crear_sesion() as session:
            stmt = (
                select(
                    PaletDB.id,
                    PaletDB.codigo,
                    PaletDB.procesado,
                    PaletDB.ubicacion_id,
                    UbicacionDB.descripcion,
                    PaletDB.duela_tipo_id,
                    DuelaDB.descripcion,
                    PaletDB.cubicaje,
                    PaletDB.consumido,
                )
                .select_from(PaletDB)
                .join(UbicacionDB, UbicacionDB.id == PaletDB.ubicacion_id, isouter=True)
                .join(DuelaDB, DuelaDB.id == PaletDB.duela_tipo_id, isouter=True)
                .order_by(UbicacionDB.descripcion, DuelaDB.descripcion, PaletDB.codigo)
            )
            rows = session.exec(stmt).all()
            resultado = []
            for row in rows:
                restante = max(float(row[7] or 0) - float(row[8] or 0), 0.0)
                if restante <= 0:
                    continue
                resultado.append(
                    {
                        "id": row[0],
                        "codigo": row[1] or "",
                        "procesado": bool(row[2]),
                        "ubicacion_id": row[3],
                        "ubicacion": row[4] or "Sin ubicación",
                        "duela_tipo_id": row[5],
                        "duela": row[6] or "Sin duela",
                        "cubicaje": float(row[7] or 0),
                        "consumido": float(row[8] or 0),
                        "restante": restante,
                    }
                )
            return resultado

    def listar_stocks_consumo(self):
        with DB.crear_sesion() as session:
            stocks = session.exec(select(StockDB)).all()
            return [StockDTO.from_db(stock) for stock in stocks]

    def listar_cubicaje(self):
        with DB.crear_sesion() as session:
            cubicajes = session.exec(select(CubicajeDB)).all()
            return [CubicajeDTO.from_db(cubicaje) for cubicaje in cubicajes]

    def obtener_contexto_consumo(self, data):
        data = data or {}
        tipo_producto_id = int(data.get("tipo_producto_id") or 0)
        material_id = int(data.get("material_id") or 0)
        ubicacion_id = int(data.get("ubicacion_id") or 0)

        with DB.crear_sesion() as session:
            stmt = select(StockDB)
            if tipo_producto_id:
                stmt = stmt.where(StockDB.tipo_producto == tipo_producto_id)
            if material_id:
                stmt = stmt.where(StockDB.id_material == material_id)
            if ubicacion_id:
                stmt = stmt.where(StockDB.id_instalacion == ubicacion_id)

            stocks_db = session.exec(stmt).all()
            stocks = []
            for s in stocks_db:
                restante = max(float(s.cantidad_stock or 0) - float(s.cantidad_consumida or 0), 0.0)
                if restante <= 0:
                    continue
                stocks.append({
                    "id": s.id,
                    "tipo_producto": s.tipo_producto,
                    "id_material": s.id_material,
                    "id_instalacion": s.id_instalacion,
                    "cantidad_stock": float(s.cantidad_stock or 0),
                    "cantidad_consumida": float(s.cantidad_consumida or 0),
                    "restante": restante,
                })

            cubicaje_estandar = 0.0
            if tipo_producto_id:
                cubicaje = session.exec(
                    select(CubicajeDB).where(CubicajeDB.tipo_producto_id == tipo_producto_id)
                ).first()
                if cubicaje:
                    cubicaje_estandar = float(cubicaje.cubicaje_estandar or 0)

            return {
                "stocks": stocks,
                "cubicaje_estandar": cubicaje_estandar,
            }

    def agregar_trazabilidad_fabricacion(self, session: Session, fabricacion_semanal_id: int, palet: PaletDB):
        existente = session.exec(
            select(TrazabilidadFabricacionDB).where(
                TrazabilidadFabricacionDB.fabricacion_semanal_id == fabricacion_semanal_id,
                TrazabilidadFabricacionDB.palet_id == palet.id,
            )
        ).first()
        if existente:
            raise ValueError("El palet ya esta asociado a esta linea de trazabilidad.")

        trazabilidad = TrazabilidadFabricacionDB(
            fabricacion_semanal_id=fabricacion_semanal_id,
            palet_id=palet.id,
        )
        session.add(trazabilidad)
        session.flush()

        return {
            "fabricacion_semanal_id": fabricacion_semanal_id,
            "trazabilidad": trazabilidad,
            "palet": palet,
        }

    def agregar_trazabilidad_fabricacion_desde_palet(self, data):
        fabricacion_semanal_id = data.get("fabricacion_semanal_id")
        lote_palet = (data.get("lote_palet") or "").strip()
        cubicaje = data.get("cubicaje")

        if not fabricacion_semanal_id:
            raise ValueError("fabricacion_semanal_id es obligatorio.")
        if not lote_palet:
            raise ValueError("lote_palet es obligatorio.")
        if cubicaje is None or str(cubicaje).strip() == "":
            raise ValueError("cubicaje es obligatorio.")

        with DB.crear_sesion() as session:
            palet = session.exec(
                select(PaletDB).where(PaletDB.codigo == lote_palet)
            ).first()
            if not palet:
                raise ValueError("No se encontro palet para lote_palet.")

            retorno = self.agregar_trazabilidad_fabricacion(session, fabricacion_semanal_id, palet)
            session.commit()
            session.refresh(retorno.trazabilidad)
            return retorno


    def agregar_trazabilidad_fabricacion_desde_stock(self, data):
        fabricacion_semanal_id = data.get("fabricacion_semanal_id")
        stock_origen_id = data.get("stock_origen_id")
        lote = (data.get("lote") or "").strip()
        cubicaje = data.get("cubicaje")
        paquetes = data.get("paquetes")

        if not fabricacion_semanal_id:
            raise ValueError("fabricacion_semanal_id es obligatorio.")
        if not stock_origen_id:
            raise ValueError("stock_origen_id es obligatorio.")
        if not lote:
            raise ValueError("lote es obligatorio.")
        if cubicaje is None or str(cubicaje).strip() == "":
            raise ValueError("cubicaje es obligatorio.")

        cubicaje_val = float(cubicaje) * float(paquetes or 1)
        if cubicaje_val <= 0:
            raise ValueError("cubicaje debe ser mayor que 0.")

        with DB.crear_sesion() as session:
            stock = session.get(StockDB, int(stock_origen_id))
            if not stock:
                raise ValueError("stock_origen no encontrado.")

            stock.cantidad_consumida = float(stock.cantidad_consumida or 0) + cubicaje_val
            session.add(stock)
            session.flush()

            duela = session.exec(
                select(DuelaDB)
                .where(DuelaDB.tipo_producto_id == stock.tipo_producto)
                .where(DuelaDB.material_id == stock.id_material)
                .order_by(DuelaDB.id)
            ).first()
            if not duela:
                raise ValueError("No existe tipo de duela para el stock seleccionado.")

            ubicacion = session.exec(
                select(UbicacionDB)
                .where(UbicacionDB.instalacion_id == stock.id_instalacion)
                .order_by(UbicacionDB.id)
            ).first()

            contador = self._siguiente_contador_global_palets(session)
            codigo_nuevo = f"{lote}#{contador:06d}"

            palet_nuevo = PaletDB(
                codigo=codigo_nuevo,
                linea_entrada_id=None,
                duela_tipo_id=duela.id,
                cubicaje=cubicaje_val,
                consumido=0.0,
                estado=stock.estado_palets,
                ubicacion_id=ubicacion.id if ubicacion else None,
                procesado=None,
            )
            session.add(palet_nuevo)
            session.flush()
            
            retorno = self.agregar_trazabilidad_fabricacion(session, fabricacion_semanal_id, palet_nuevo)
            session.commit()
            session.refresh(stock)
            session.refresh(palet_nuevo)
            session.refresh(retorno.trazabilidad)
            return retorno

    def eliminar_trazabilidad_fabricacion(self, data):
        trazabilidad_id = data.get("id")
        if not trazabilidad_id:
            raise ValueError("id es obligatorio.")
        with DB.crear_sesion() as session:
            trazabilidad = session.get(TrazabilidadFabricacionDB, trazabilidad_id)
            if not trazabilidad:
                raise ValueError("Registro no encontrado.")
            if trazabilidad.cantidad_fabricada and trazabilidad.cantidad_fabricada > 0:
                raise ValueError("No se puede eliminar con cantidad > 0.")
            session.delete(trazabilidad)
            session.commit()
            return {"id": trazabilidad_id}

    def actualizar_estado_trazabilidad_fabricacion(self, data):
        trazabilidad_id = data.get("id")
        estado = data.get("estado", 0)
        if not trazabilidad_id:
            raise ValueError("id es obligatorio.")
        with DB.crear_sesion() as session:
            trazabilidad = session.get(TrazabilidadFabricacionDB, trazabilidad_id)
            if not trazabilidad:
                raise ValueError("Registro no encontrado.")
            trazabilidad.estado = int(estado)
            session.add(trazabilidad)
            session.commit()
            session.refresh(trazabilidad)
            return {
                "id": trazabilidad.id,
                "estado": trazabilidad.estado,
            }

    def imprimir_etiqueta_fabricacion(self, data, ws=None):
        trazabilidad_ids = data.get("trazabilidad_ids") or []
        palet_codigos = data.get("palet_codigos") or []
        tipo = data.get("tipo") or "BOTA"
        cantidad_etiquetas = int(data.get("cantidad_etiquetas") or 1)
        operarios_ids_input = data.get("operarios_ids") or []
        batidero = data.get("batidero")
        if not isinstance(operarios_ids_input, list):
            operarios_ids_input = [operarios_ids_input]
        operarios_ids_producto = self._normalizar_ids_operarios(operarios_ids_input)
        operarios_ids_codigo = list(operarios_ids_producto)
        batidero_id = None
        codigos_batidero_validos = {11, 12, 13, 21, 22, 23}
        try:
            if batidero is not None and batidero != "":
                batidero_id = int(batidero)
        except (TypeError, ValueError):
            batidero_id = None
        if batidero_id is not None and batidero_id not in codigos_batidero_validos:
            raise ValueError("Codigo de batidero invalido. Valores permitidos: 11, 12, 13, 21, 22, 23.")
        if batidero_id is not None:
            if operarios_ids_codigo:
                resto = [op for op in operarios_ids_codigo[1:] if op != batidero_id]
                operarios_ids_codigo = [operarios_ids_codigo[0], batidero_id] + resto
            else:
                operarios_ids_codigo = [batidero_id]

        if not trazabilidad_ids:
            raise ValueError("No hay trazabilidades activas.")
        if cantidad_etiquetas < 1:
            raise ValueError("cantidad_etiquetas debe ser mayor o igual a 1.")

        with DB.crear_sesion() as session:
            try:
                with session.begin():
                    if operarios_ids_producto:
                        ids_existentes = set(session.exec(
                            select(UsuarioDB.id).where(UsuarioDB.id.in_(operarios_ids_producto))
                        ).all())
                        operarios_ids_producto = [op for op in operarios_ids_producto if op in ids_existentes]

                    trazas = session.exec(
                        select(TrazabilidadFabricacionDB).where(
                            TrazabilidadFabricacionDB.id.in_(trazabilidad_ids)
                        )
                    ).all()

                    if not trazas:
                        raise ValueError("Trazabilidades no encontradas.")

                    for t in trazas:
                        if t.estado != 0:
                            raise ValueError("Hay trazabilidades no activas.")

                    if not palet_codigos:
                        palet_ids = [t.palet_id for t in trazas]
                        palets = session.exec(select(PaletDB).where(PaletDB.id.in_(palet_ids))).all()
                        palet_map = {p.id: p.codigo for p in palets}
                        palet_codigos = [palet_map.get(t.palet_id, "") for t in trazas]

                    produccion_id = None
                    if trazas:
                        linea_ref = session.get(FabricacionSemanalDB, trazas[0].fabricacion_semanal_id)
                        if linea_ref:
                            produccion_id = linea_ref.pedido_id

                    codigos_generados = []
                    ultimo_producto_id = None

                    for _ in range(cantidad_etiquetas):
                        codigo = self._generar_codigo_producto(session, trazas, palet_codigos, operarios_ids_codigo)
                        logger.info("Etiqueta fabricacion: codigo=%s origenes=%s", codigo, palet_codigos)
                        codigos_generados.append(codigo)

                        producto = ProductoDB(
                            tipo=tipo,
                            codigo=codigo,
                            produccion_id=produccion_id,
                        )
                        session.add(producto)
                        session.flush()
                        session.refresh(producto)
                        ultimo_producto_id = producto.id

                        for operario_id in operarios_ids_producto:
                            session.add(
                                ProductoOperarioDB(
                                    producto_id=producto.id,
                                    usuario_id=operario_id,
                                    codigo_batidero=batidero_id if tipo == "BOTA" else None,
                                )
                            )

                        for t in trazas:
                            session.add(TrazabilidadProductoDB(trazabilidad_fabricacion_id=t.id, producto_id=producto.id))

                    for t in trazas:
                        t.cantidad_fabricada = int(t.cantidad_fabricada or 0) + cantidad_etiquetas
                        session.add(t)

                    lineas_unicas = {t.fabricacion_semanal_id for t in trazas}
                    for linea_id in lineas_unicas:
                        linea = session.get(FabricacionSemanalDB, linea_id)
                        if linea:
                            linea.cantidad_fabricada = int(linea.cantidad_fabricada or 0) + cantidad_etiquetas
                            session.add(linea)
            except Exception as exc:
                session.rollback()
                logger.error("Error al crear etiqueta: %s", exc)
                try:
                    import asyncio
                    from servidor.conexiones.broadcast import broadcast_error

                    asyncio.run(
                        broadcast_error(
                            "No se pudo crear la etiqueta. Revisa los datos e intentalo de nuevo.",
                            scope="cliente" if ws is not None else "all",
                            target_ws=ws,
                        )
                    )
                except Exception:
                    pass
                raise

            threading.Thread(
                target=self._imprimir_etiquetas_async,
                args=(codigos_generados, palet_codigos, ws),
                daemon=True,
            ).start()

            return {
                "producto_id": ultimo_producto_id,
                "codigo": codigos_generados[-1] if codigos_generados else "",
                "codigos": codigos_generados,
                "cantidad": cantidad_etiquetas,
            }

    def _imprimir_etiqueta_async(self, codigo: str, origenes: list[str], ws=None):
        self._imprimir_etiquetas_async([codigo], origenes, ws)

    def _imprimir_etiquetas_async(self, codigos: list[str], origenes: list[str], ws=None):
        try:
            impresora = ImprimirEtiqueta()
            etiqueta = ""
            for codigo in codigos:
                etiqueta = etiqueta + impresora.obtener_etiqueta("botas", codigo, copies=1)
                #impresora.imprimir_etiqueta("botas", codigo, copies=1)
            impresora.imprimir_zpl(etiqueta)
            try:
                import asyncio

                #si error, probar await broadcast_event(...) sin asyncio.run
                # o asyncio.create_task(broadcast_event(...)) si ya estamos dentro de un loop
                asyncio.run(
                    broadcast_event(
                        "async_print",
                        {"codigo": codigos, "origenes": origenes, "tipo": "botas"},
                        scope="cliente" if ws is not None else "all",
                        target_ws=ws,
                    )
                )
            except Exception:
                pass
        except Exception as exc:
            msg = f"Fallo al imprimir etiquetas {codigos} (origenes: {origenes}): {exc}"
            logger.error(msg)
            try:
                import asyncio

                asyncio.run(
                    broadcast_error(
                        msg,
                        scope="cliente" if ws is not None else "all",
                        target_ws=ws,
                    )
                )
            except Exception:
                pass

    def _construir_codigo_base(self, codigos):
        codigos = [c for c in codigos if c]
        if not codigos:
            raise ValueError("Codigos de palet vacios.")
        base = codigos[0]
        sep = "-"
        if len(codigos) > 1:
            sep = "X"
        return base, sep

    def _normalizar_ids_operarios(self, ids):
        vistos = set()
        normalizados = []
        for op in ids or []:
            try:
                op_id = int(op)
            except (TypeError, ValueError):
                continue
            if op_id in vistos:
                continue
            vistos.add(op_id)
            normalizados.append(op_id)
        return normalizados

    def _extraer_prefijo_lote(self, palet_codigo: str | None) -> str:
        if not palet_codigo:
            return ""
        # Para los codigos de palet tipo "lote#000001" tomamos solo la parte lote.
        texto = str(palet_codigo).split("#", 1)[0]
        return texto[:5]

    def _formatear_operarios(self, operarios_ids: list[int]) -> str:
        op1 = operarios_ids[0] if len(operarios_ids) > 0 else None
        op2 = operarios_ids[1] if len(operarios_ids) > 1 else None
        part1 = f"{int(op1) % 100:02d}" if op1 is not None else "00"
        part2 = f"{int(op2) % 100:02d}" if op2 is not None else "00"
        return f"{part1}{part2}"

    def _siguiente_contador_anual(self, session, year_two: str, sep: str) -> int:
        like_pattern = f"%{sep}{year_two}_______"
        statement = select(ProductoDB.codigo).where(ProductoDB.codigo.like(like_pattern))
        codigos = session.exec(statement).all()
        max_cont = 0
        sufijo_len = len(sep) + 2 + 2 + 5
        for codigo in codigos:
            if not codigo or len(codigo) < sufijo_len:
                continue
            tail = codigo[-sufijo_len:]
            if not tail.startswith(f"{sep}{year_two}") or not tail[-5:].isdigit():
                continue
            cont = int(tail[-5:])
            if cont > max_cont:
                max_cont = cont
        return max_cont + 1

    def _siguiente_contador_global_palets(self, session) -> int:
        codigos = session.exec(select(PaletDB.codigo)).all()
        patron = re.compile(r"#(\d{6})$")
        max_cont = 0
        for codigo in codigos:
            if not codigo:
                continue
            m = patron.search(str(codigo))
            if not m:
                continue
            cont = int(m.group(1))
            if cont > max_cont:
                max_cont = cont
        return max_cont + 1

    def siguiente_codigo_palet(self, data):
        lote = (data.get("lote") or "").strip()
        palet_codigo = data.get("palet_codigo")
        prefijo = lote or self._extraer_prefijo_lote(palet_codigo)
        if not prefijo:
            raise ValueError("No se pudo determinar el prefijo del lote.")

        with DB.crear_sesion() as session:
            contador = self._siguiente_contador_global_palets(session)
            codigo_nuevo = f"{prefijo}#{contador:06d}"
            while session.exec(select(PaletDB).where(PaletDB.codigo == codigo_nuevo)).first():
                contador += 1
                codigo_nuevo = f"{prefijo}#{contador:06d}"
            return {"codigo": codigo_nuevo, "prefijo": prefijo, "contador": contador}

    def _generar_codigo_producto(self, session, trazas, palet_codigos, operarios_ids: list[int]) -> str:
        sep = "X" if len([c for c in palet_codigos if c]) > 1 else "-"

        prefijo_lote = ""
        if palet_codigos:
            prefijo_lote = self._extraer_prefijo_lote(palet_codigos[0])
        else:
            palet_id = trazas[0].palet_id if trazas else None
            if palet_id:
                palet = session.get(PaletDB, palet_id)
                if palet:
                    prefijo_lote = self._extraer_prefijo_lote(palet.codigo)

        operarios_part = self._formatear_operarios(operarios_ids)
        year_two = str(date.today().year % 100).zfill(2)
        month_two = str(date.today().month).zfill(2)
        contador = self._siguiente_contador_anual(session, year_two, sep)

        return f"{prefijo_lote}{operarios_part}{sep}{year_two}{month_two}{contador:05d}"

    def inventario_duelas(self) -> dict:
        with DB.crear_sesion() as session:
            palets_stmt = (
                select(
                    PaletDB.duela_tipo_id,
                    DuelaDB.descripcion,
                    UbicacionDB.id,
                    UbicacionDB.descripcion,
                    func.count(PaletDB.id).label("total_palets"),
                    func.coalesce(func.sum(PaletDB.cubicaje), 0).label("total_cubicaje"),
                    func.coalesce(func.sum(PaletDB.consumido), 0).label("total_consumido"),
                    func.coalesce(func.sum(PaletDB.cubicaje - PaletDB.consumido), 0).label("total_restante"),
                )
                .select_from(PaletDB)
                .join(UbicacionDB, UbicacionDB.id == PaletDB.ubicacion_id, isouter=True)
                .join(DuelaDB, DuelaDB.id == PaletDB.duela_tipo_id, isouter=True)
                .where(PaletDB.procesado == False)
                .group_by(
                    PaletDB.duela_tipo_id,
                    DuelaDB.descripcion,
                    UbicacionDB.id,
                    UbicacionDB.descripcion,
                )
                .order_by(DuelaDB.descripcion, UbicacionDB.descripcion)
            )
            palets_rows = session.exec(palets_stmt).all()

            return {
                "palets_por_duela_ubicacion": [
                    {
                        "duela_tipo_id": row[0],
                        "duela": row[1] or "Sin tipo",
                        "ubicacion_id": row[2],
                        "ubicacion": row[3] or "Sin ubicación",
                        "total_palets": int(row[4] or 0),
                        "total_cubicaje": float(row[5] or 0),
                        "total_consumido": float(row[6] or 0),
                        "total_restante": float(row[7] or 0),
                    }
                    for row in palets_rows
                ],
            }

    def inventario_flejes(self) -> dict:
        with DB.crear_sesion() as session:
            stmt = (
                select(
                    EntradaFlejeDB.id,
                    EntradaFlejeDB.fecha,
                    EntradaFlejeDB.tipo_producto_id,
                    TipoProductoDB.tipo,
                    TipoProductoDB.descripcion,
                    EntradaFlejeDB.lote,
                    EntradaFlejeDB.peso,
                    EntradaFlejeDB.consumido,
                    func.greatest(EntradaFlejeDB.peso - EntradaFlejeDB.consumido, 0).label("restante_calc"),
                    EntradaFlejeDB.estado,
                    EntradaFlejeDB.created_at,
                    EntradaFlejeDB.updated_at,
                    EntradaFlejeDB.deleted_at,
                    EntradaFlejeDB.is_deleted,
                    EntradaFlejeDB.created_by,
                    EntradaFlejeDB.updated_by,
                    EntradaFlejeDB.deleted_by,
                )
                .select_from(EntradaFlejeDB)
                .join(TipoProductoDB, TipoProductoDB.id == EntradaFlejeDB.tipo_producto_id, isouter=True)
                .where(EntradaFlejeDB.is_deleted == False)
                .order_by(EntradaFlejeDB.fecha.desc(), EntradaFlejeDB.id.desc())
            )
            rows = session.exec(stmt).all()

            return {
                "inventario_flejes": [
                    {
                        "id": row[0],
                        "fecha": row[1].isoformat() if row[1] else None,
                        "tipo_producto_id": row[2],
                        "tipo_producto_tipo": row[3] or "",
                        "tipo_producto_descripcion": row[4] or "",
                        "tipo_producto_consumo": 0.0,
                        "lote": row[5] or "",
                        "peso": float(row[6] or 0),
                        "consumido": float(row[7] or 0),
                        "restante": float(row[8] or 0),
                        "estado": int(row[9] or 0),
                        "created_at": row[10].isoformat() if row[10] else None,
                        "updated_at": row[11].isoformat() if row[11] else None,
                        "deleted_at": row[12].isoformat() if row[12] else None,
                        "is_deleted": bool(row[13]),
                        "created_by": row[14] or "",
                        "updated_by": row[15] or "",
                        "deleted_by": row[16] or "",
                    }
                    for row in rows
                ]
            }
    #endregion

    #region Métodos Cuadrantes
    def obtener_cuadrante_actual(self) -> dict:
        if not self.cuadrantes.cuadrante_actual:
            fecha_inicial = obtener_anterior_dia_semana().isoformat()
            actual = self.obtener_cuadrante(fecha_inicial)
            self.cuadrantes.cuadrante_actual = actual    

    def obtener_cuadrante(self, fecha: str, actualizar_local = False) -> CuadranteDTO:
        with DB.crear_sesion() as session:
            cuadrante = self.repo_cuadrantes.list_by_start_date(session, fecha)
            if cuadrante is None:
                cuadrante = self.insertar_cuadrante(date.fromisoformat(fecha))

            detalles = self.repo_cuadrante_detalles.list_by_cuadrante_id(session, cuadrante.id)

            cuadrante_dto = CuadranteDTO.from_db(cuadrante)
            cuadrante_dto.detalles = [CuadranteDetalleDTO.from_db(det) for det in detalles]
        
            if actualizar_local:
                self.cuadrante = cuadrante_dto

            return cuadrante_dto
        
    def insertar_cuadrante(self, fecha: date) -> CuadranteDB:
        with DB.crear_sesion() as session:
            DTO = CuadranteDTO(
                id=None,
                fecha_inicio=fecha,
                fecha_fin=fecha + timedelta(days=6),
                titulo="",
                observaciones="",
                detalles=[],
            )
            return self.repo_cuadrantes.insert(session, DTO.to_db())

    def insertar_detalle_cuadrante(self, data) -> CuadranteDetalleDTO:
        cuadrante_id = data.get("cuadrante_id")
        fecha = data.get("fecha")
        puesto_id = data.get("puesto_id")
        usuario_id = data.get("usuario_id")
        with DB.crear_sesion() as session:
            DTO = CuadranteDetalleDTO(
                id=None,
                cuadrante_id=cuadrante_id,
                puesto_id=puesto_id,
                fecha=date.fromisoformat(fecha),
                usuario_id=usuario_id,
            )
            return CuadranteDetalleDTO.from_db(self.repo_cuadrante_detalles.insert(session, DTO.to_db()))

    def actualizar_detalle_cuadrante(self, data) -> CuadranteDetalleDTO:
        entrada_id = data.get("id")
        cuadrante_id = data.get("cuadrante_id")
        fecha = data.get("fecha")
        puesto_id = data.get("puesto_id")
        usuario_id = data.get("usuario_id")

        with DB.crear_sesion() as session:
            DTO = CuadranteDetalleDTO(
                id=entrada_id,
                cuadrante_id=cuadrante_id,
                puesto_id=puesto_id,
                fecha=date.fromisoformat(fecha),
                usuario_id=usuario_id,
            )
            updated = CuadranteDetalleDTO.to_db(DTO)
            return CuadranteDetalleDTO.from_db(self.repo_cuadrante_detalles.update(session, updated))

    def eliminar_detalle_cuadrante(self, data):
        id = data.get("id")

        with DB.crear_sesion() as session:
            self.repo_cuadrante_detalles.delete(session, id)
            try:
                session.commit()
            except Exception:
                session.rollback()
                raise
            logger.info(f"Detalle de cuadrante ID {id} eliminado.")
            return {"id": id }

    def clonar_columna_cuadrante(self, data) -> CuadranteDTO:
        cuadrante_id = data.get("cuadrante_id")
        fecha_origen = data.get("fecha_origen")
        fecha_destino = data.get("fecha_destino")
        mantener_datos_destino = bool(data.get("mantener_datos_destino"))

        if not cuadrante_id:
            raise ValueError("cuadrante_id requerido")
        if not fecha_origen or not fecha_destino:
            raise ValueError("fecha_origen y fecha_destino son requeridas")
        if fecha_origen == fecha_destino:
            raise ValueError("fecha_origen y fecha_destino deben ser diferentes")

        fecha_origen_date = date.fromisoformat(fecha_origen)
        fecha_destino_date = date.fromisoformat(fecha_destino)

        with DB.crear_sesion() as session:
            cuadrante = self.repo_cuadrantes.get(session, cuadrante_id)
            if not cuadrante:
                raise ValueError(f"No existe cuadrante con id {cuadrante_id}")

            detalles = self.repo_cuadrante_detalles.list_by_cuadrante_id(session, cuadrante_id)
            detalles_origen = [d for d in detalles if d.fecha == fecha_origen_date]
            detalles_destino = [d for d in detalles if d.fecha == fecha_destino_date]

            if not mantener_datos_destino:
                for det in detalles_destino:
                    session.delete(det)
                detalles_destino = []

            firmas_destino = {(d.puesto_id, d.usuario_id) for d in detalles_destino}
            nuevos_detalles = []
            for det in detalles_origen:
                firma = (det.puesto_id, det.usuario_id)
                if firma in firmas_destino:
                    continue
                firmas_destino.add(firma)
                nuevos_detalles.append(
                    CuadranteDetalleDB(
                        fecha=fecha_destino_date,
                        cuadrante_id=cuadrante_id,
                        puesto_id=det.puesto_id,
                        usuario_id=det.usuario_id,
                        orden_en_puesto=det.orden_en_puesto,
                    )
                )

            if nuevos_detalles:
                session.add_all(nuevos_detalles)

            try:
                session.commit()
            except Exception:
                session.rollback()
                raise

            detalles_actualizados = self.repo_cuadrante_detalles.list_by_cuadrante_id(session, cuadrante_id)
            cuadrante_dto = CuadranteDTO.from_db(cuadrante)
            cuadrante_dto.detalles = [CuadranteDetalleDTO.from_db(det) for det in detalles_actualizados]
            return cuadrante_dto

    def extender_jueves_semana_cuadrante(self, data):
        cuadrante_id = data.get("cuadrante_id")
        fecha_origen = data.get("fecha")

        if not cuadrante_id:
            raise ValueError("cuadrante_id requerido")
        if not fecha_origen:
            raise ValueError("fecha requerida (YYYY-MM-DD)")

        fecha_jueves = date.fromisoformat(str(fecha_origen))
        # Jueves -> Viernes (+1) -> Lunes (+3) -> Martes (+1) -> Miercoles (+1)
        fechas_destino = [
            fecha_jueves + timedelta(days=1),
            fecha_jueves + timedelta(days=4),
            fecha_jueves + timedelta(days=5),
            fecha_jueves + timedelta(days=6),
        ]

        with DB.crear_sesion() as session:
            cuadrante = self.repo_cuadrantes.get(session, cuadrante_id)
            if not cuadrante:
                raise ValueError(f"No existe cuadrante con id {cuadrante_id}")

            detalles = self.repo_cuadrante_detalles.list_by_cuadrante_id(session, cuadrante_id)
            detalles_jueves = [d for d in detalles if d.fecha == fecha_jueves]
            if not detalles_jueves:
                raise ValueError("El jueves indicado no tiene asignaciones en este cuadrante.")

            puestos = self.repo_puestos_trabajo.list_all(session)
            puesto_batidero_manana_id = None
            puesto_batidero_tarde_id = None
            for puesto in puestos:
                nombre = str(getattr(puesto, "nombre", "")).strip()
                if nombre == "BATIDERO MAÑANA":
                    puesto_batidero_manana_id = puesto.id
                elif nombre == "BATIDERO TARDE":
                    puesto_batidero_tarde_id = puesto.id

            for indice_destino, fecha_destino in enumerate(fechas_destino):
                # Borrar previamente todo lo del dia destino para este cuadrante
                for det in [d for d in detalles if d.fecha == fecha_destino]:
                    session.delete(det)

                # Insertar copias desde jueves, alternando puestos de batidero
                nuevos = []
                for det in detalles_jueves:
                    puesto_destino_id = det.puesto_id
                    # Alternancia semanal: Vie(swapped), Lun(normal), Mar(swapped), Mie(normal)
                    aplicar_swap = (indice_destino % 2 == 0)
                    if aplicar_swap and puesto_batidero_manana_id and puesto_batidero_tarde_id:
                        if puesto_destino_id == puesto_batidero_manana_id:
                            puesto_destino_id = puesto_batidero_tarde_id
                        elif puesto_destino_id == puesto_batidero_tarde_id:
                            puesto_destino_id = puesto_batidero_manana_id

                    nuevos.append(
                        CuadranteDetalleDB(
                            fecha=fecha_destino,
                            cuadrante_id=cuadrante_id,
                            puesto_id=puesto_destino_id,
                            usuario_id=det.usuario_id,
                            orden_en_puesto=det.orden_en_puesto,
                        )
                    )

                if nuevos:
                    session.add_all(nuevos)

            try:
                session.commit()
            except Exception:
                session.rollback()
                raise

            detalles_actualizados = self.repo_cuadrante_detalles.list_by_cuadrante_id(session, cuadrante_id)
            cuadrante_dto = CuadranteDTO.from_db(cuadrante)
            cuadrante_dto.detalles = [CuadranteDetalleDTO.from_db(det) for det in detalles_actualizados]
            return cuadrante_dto
    #endregion

    #region Métodos Auxiliares
    def obtener_repo(self, tabla):
        if tabla == "clientes":
            repo = self.repo_clientes
            maestro = self.maestros.clientes
            objeto = ClienteDTO
        elif tabla == "estados_pedidos":
            repo = self.repo_estados_pedidos
            maestro = self.maestros.estados_pedidos
            objeto = EstadoPedidoDTO
        elif tabla == "estados_fabricacion_semanal":
            repo = self.repo_estados_fabricacion_semanal
            maestro = self.maestros.estados_fabricacion_semanal
            objeto = EstadoFabricacionSemanalDTO
        elif tabla == "estados_botas":
            repo = self.repo_estados_botas
            maestro = self.maestros.estados_botas
            objeto = EstadoBotaDTO
        elif tabla == "estados_trazabilidad_fabricacion":
            repo = self.repo_estados_trazabilidad_fabricacion
            maestro = self.maestros.estados_trazabilidad_fabricacion
            objeto = EstadoTrazabilidadFabricacionDTO
        elif tabla == "estados_palets":
            repo = self.repo_estados_palets
            maestro = self.maestros.estados_palets
            objeto = EstadoPaletDTO
        elif tabla == "instalaciones":
            repo = self.repo_instalaciones
            maestro = self.maestros.instalaciones
            objeto = InstalacionDTO
        elif tabla == "puestos_trabajo":
            repo = self.repo_puestos_trabajo
            maestro = self.maestros.puestos_trabajo
            objeto = PuestoTrabajoDTO
        elif tabla == "ubicaciones":
            repo = self.repo_ubicaciones
            maestro = self.maestros.ubicaciones
            objeto = UbicacionDTO
        elif tabla == "proveedores":
            repo = self.repo_proveedores
            maestro = self.maestros.proveedores
            objeto = ProveedorDTO
        elif tabla == "usuarios":
            repo = self.repo_usuarios
            maestro = self.maestros.usuarios
            objeto = UsuarioDTO
        elif tabla == "roles":
            repo = self.repo_roles
            maestro = self.maestros.roles
            objeto = RolDTO
        elif tabla == "planificacion_entradas":
            repo = self.repo_camiones
            maestro = self.planificacion_entradas.buscar_camion_por_id
            objeto = PlanCamionDTO
        elif tabla == "materiales":
            repo = self.repo_materiales_maestro
            maestro = self.maestros.materiales
            objeto = MaterialDTO
        elif tabla == "duelas":
            repo = self.repo_duelas
            maestro = self.maestros.duelas
            objeto = DuelaDTO
        elif tabla == "entradas":
            repo = self.repo_entradas
            maestro = self.maestros.entradas
            objeto = EntradaDTO
        elif tabla == "lineas_entrada":
            repo = self.repo_lineas_entrada
            maestro = self.maestros.lineas_entrada
            objeto = LineaEntradaDTO
        elif tabla == "palets":
            repo = self.repo_palets
            maestro = self.maestros.palets
            objeto = PaletDTO
        elif tabla == "productos":
            repo = self.repo_productos
            maestro = self.maestros.productos
            objeto = ProductoDTO
        elif tabla == "archivos_subidos":
            repo = self.repo_archivos_subidos
            maestro = self.maestros.archivos_subidos
            objeto = ArchivoSubidoDTO
        elif tabla == "ambientes":
            repo = self.repo_ambientes
            maestro = self.maestros.ambientes
            objeto = AmbienteDTO
        elif tabla == "entradas_flejes":
            repo = self.repo_entradas_flejes
            maestro = self.maestros.entradas_flejes
            objeto = EntradaFlejeDTO
        elif tabla == "stocks":
            repo = self.repo_stocks
            maestro = self.maestros.stocks
            objeto = StockDTO
        elif tabla == "cubicaje":
            repo = self.repo_cubicaje
            maestro = self.maestros.cubicaje
            objeto = CubicajeDTO
        elif tabla == "pedidos":
            repo = self.repo_pedidos
            maestro = self.fabricacion.pedidos
            objeto = PedidoDTO
        elif tabla == "tipos_producto":
            repo = self.repo_tipos_producto
            maestro = self.fabricacion.tipos_producto
            objeto = TipoProductoDTO
        elif tabla == "fabricacion_semanal":
            repo = self.repo_fabricacion_semanal
            maestro = self.fabricacion.fabricacion_semanal
            objeto = FabricacionSemanalDTO
        elif tabla == "trazabilidad_procesado":
            repo = self.repo_trazabilidad_procesado
            maestro = self.fabricacion.trazabilidad_procesado
            objeto = TrazabilidadProcesadoDTO
        elif tabla == "trazabilidad_fabricacion":
            repo = self.repo_trazabilidad_fabricacion
            maestro = self.fabricacion.trazabilidad_fabricacion
            objeto = TrazabilidadFabricacionDTO
        elif tabla == "trazabilidad_producto":
            repo = self.repo_trazabilidad_producto
            maestro = self.fabricacion.trazabilidad_producto
            objeto = TrazabilidadProductoDTO
        elif tabla == "botas":
            repo = self.repo_botas
            maestro = self.fabricacion.botas
            objeto = BotaDTO
        elif tabla == "consumos":
            repo = self.repo_consumos
            maestro = self.fabricacion.consumos
            objeto = ConsumoDTO
        elif tabla == "plan_materiales":
            repo = self.repo_materiales
            maestro = self.planificacion_entradas.buscar_material_por_id
            objeto = PlanMaterialDTO
        elif tabla == "facturacion":
            repo = self.repo_facturacion
            maestro = self.planificacion_entradas.buscar_facturacion_por_id
            objeto = PlanFacturacionDTO
        elif tabla == "cuadrantes":
            repo = self.repo_cuadrantes
            maestro = None
            objeto = CuadranteDTO
        elif tabla == "cuadrante_detalles":
            repo = self.repo_cuadrante_detalles
            maestro = None
            objeto = CuadranteDetalleDTO
        else:
            raise ValueError(f"Tabla '{tabla}' no reconocida.")

        return repo, maestro, objeto

    #region Operarios Fabricacion (planificacion)
    def _ultimos_dias_laborables(self, dias_previos: int = 3, base: date | None = None) -> List[date]:
        if base is None:
            base = date.today()
        fechas = [base]
        cursor = base
        count = 0
        while count < dias_previos:
            cursor = cursor - timedelta(days=1)
            if cursor.weekday() >= 5:
                continue
            fechas.append(cursor)
            count += 1
        return fechas

    def listar_operarios_planificacion_fabricacion(self, filtros: dict | None = None) -> list:
        filtros = filtros or {}
        dias_previos = int(filtros.get("dias_previos") or 3)
        if dias_previos < 0:
            dias_previos = 0
        incluir_otros = bool(filtros.get("incluir_otros", True))
        puesto_nombre = (filtros.get("puesto_nombre") or "").strip().upper()

        fechas = self._ultimos_dias_laborables(dias_previos=dias_previos)
        fechas_set = set(fechas)
        with DB.crear_sesion() as session:
            puestos = session.exec(
                select(PuestoTrabajoDB).where(PuestoTrabajoDB.fabricacion == True)  # noqa: E712
            ).all()
            if puesto_nombre:
                puestos = [p for p in puestos if (p.nombre or "").strip().upper() == puesto_nombre]
            puestos_map = {p.id: p for p in puestos}
            puestos_ids = list(puestos_map.keys())

            usuarios = session.exec(
                select(UsuarioDB).where(UsuarioDB.empleado == True)  # noqa: E712
            ).all()
            usuarios_map = {u.id: u for u in usuarios}

            detalles = []
            if puestos_ids:
                detalles = session.exec(
                    select(CuadranteDetalleDB).where(
                        CuadranteDetalleDB.puesto_id.in_(puestos_ids),
                        CuadranteDetalleDB.fecha.in_(list(fechas_set)),
                    )
                ).all()

            resultado = []
            usados = set()
            for det in detalles:
                usuario = usuarios_map.get(det.usuario_id)
                if usuario:
                    usados.add(usuario.id)
                resultado.append({
                    "origen": "planificacion",
                    "fecha": det.fecha.isoformat() if det.fecha else None,
                    "puesto_id": det.puesto_id,
                    "puesto_nombre": puestos_map.get(det.puesto_id).nombre if det.puesto_id in puestos_map else None,
                    "usuario_id": det.usuario_id,
                    "usuario": {
                        "id": usuario.id,
                        "alias": usuario.alias,
                        "nombre": usuario.nombre,
                        "rol_id": usuario.rol_id,
                        "empleado": usuario.empleado,
                    } if usuario else None,
                    "orden_en_puesto": det.orden_en_puesto,
                })

            if incluir_otros:
                for usuario in usuarios:
                    if usuario.id in usados:
                        continue
                    resultado.append({
                        "origen": "otros",
                        "fecha": None,
                        "puesto_id": None,
                        "puesto_nombre": None,
                        "usuario_id": usuario.id,
                        "usuario": {
                            "id": usuario.id,
                            "alias": usuario.alias,
                            "nombre": usuario.nombre,
                            "rol_id": usuario.rol_id,
                            "empleado": usuario.empleado,
                        },
                        "orden_en_puesto": None,
                    })

            return resultado
    #endregion
    
    def checkUpdate(self, objeto, tabla, entrada_id, campo):
        if not objeto:
            raise ValueError(f"Entrada con ID {entrada_id} no encontrada en la tabla '{tabla}'.")
        if not hasattr(objeto, campo):
            raise ValueError(f"Campo '{campo}' no existe en la entrada de la tabla '{tabla}'.")

    def _es_union_con_none(self, annotation) -> tuple[bool, tuple]:
        args = tuple(get_args(annotation) or ())
        if not args:
            return False, ()
        contiene_none = any(arg is type(None) for arg in args)
        return contiene_none, args

    def _normalizar_vacio_numerico(self, dto_cls, campo: str, valor):
        # Solo normaliza campos de negocio de tipo cantidad*/estado* cuando llega "".
        if valor != "":
            return valor
        nombre = str(campo or "").strip().lower()
        if not (nombre.startswith("cantidad") or nombre.startswith("estado")):
            return valor
        field_info = getattr(dto_cls, "model_fields", {}).get(campo) if dto_cls else None
        if not field_info:
            return valor

        annotation = field_info.annotation
        contiene_none, args = self._es_union_con_none(annotation)
        tipos = args if args else (annotation,)

        es_int = int in tipos
        es_float = float in tipos

        if not (es_int or es_float):
            return valor

        if nombre.startswith("estado"):
            # En estados opcionales respetamos null; en no opcionales usamos 0.
            return None if contiene_none else 0
        return 0.0 if es_float else 0

    def _normalizar_data_vacia_numerica(self, dto_cls, data: dict | None):
        normalizada = dict(data or {})
        for campo, valor in list(normalizada.items()):
            normalizada[campo] = self._normalizar_vacio_numerico(dto_cls, campo, valor)
        return normalizada

    def limpiar_datos(self):
        #self.datos.clear()
        pass
    #endregion

