from datetime import date, timedelta
import logging
import threading
from typing import List

from servidor.herramientas.utilidades import obtener_anterior_dia_semana

from .modelos import ClienteDB, EstadoDB, InstalacionDB, UbicacionDB, ProveedorDB, UsuarioDB, RolDB, PuestoTrabajoDB, MaterialDB, DuelaDB, EntradaDB, LineaEntradaDB, PaletDB, ProductoDB, ArchivoSubidoDB
from .modelos import OrdenFabricacionDB, TipoProductoDB, LineaFabricacionDB, TrazabilidadProcesadoDB, TrazabilidadFabricacionDB, TrazabilidadProductoDB, BotaDB
from .modelos import PlanCamionDB, PlanFacturacionDB, PlanMaterialDB, CuadranteDB, CuadranteDetalleDB
from .persistencia import GenericRepository, DB
from sqlmodel import select
from sqlalchemy import extract
from .dominio import PlanificacionEntradasDTO, MaestrosDTO, PlanMaterialDTO, PlanFacturacionDTO, PlanCamionDTO, CuadranteDTO, CuadranteDetalleDTO, FabricacionDTO
from .dominio import ClienteDTO, EstadoDTO, InstalacionDTO, UbicacionDTO, ProveedorDTO, UsuarioDTO, RolDTO, PuestoTrabajoDTO, MaterialDTO, DuelaDTO, EntradaDTO, LineaEntradaDTO, PaletDTO, ProductoDTO, ArchivoSubidoDTO, CuadrantesDTO
from .dominio import OrdenFabricacionDTO, TipoProductoDTO, LineaFabricacionDTO, TrazabilidadProcesadoDTO, TrazabilidadFabricacionDTO, TrazabilidadProductoDTO, BotaDTO
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
        self.repo_estados = GenericRepository(EstadoDB)
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
        self.repo_ordenes_fabricacion = GenericRepository(OrdenFabricacionDB)
        self.repo_tipos_producto = GenericRepository(TipoProductoDB)
        self.repo_lineas_fabricacion = GenericRepository(LineaFabricacionDB)
        self.repo_trazabilidad_procesado = GenericRepository(TrazabilidadProcesadoDB)
        self.repo_trazabilidad_fabricacion = GenericRepository(TrazabilidadFabricacionDB)
        self.repo_trazabilidad_producto = GenericRepository(TrazabilidadProductoDB)
        self.repo_botas = GenericRepository(BotaDB)

        self.repo_usuarios = GenericRepository(UsuarioDB)
        self.repo_roles = GenericRepository(RolDB)

        self.repo_cuadrantes = GenericRepository(CuadranteDB)
        self.repo_cuadrante_detalles = GenericRepository(CuadranteDetalleDB)


    #region Métodos Maestros


    def obtener_datos_maestros(self) -> dict:
        with DB.crear_sesion() as session:
            clientes = self.repo_clientes.list_all(session)
            estados = self.repo_estados.list_all(session)
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

            self.maestros.clientes = {cliente.id: ClienteDTO.from_db(cliente) for cliente in clientes}
            self.maestros.estados = {estado.id: EstadoDTO.from_db(estado) for estado in estados}
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

            #print("Datos maestros cargados:", self.maestros)
            #print("Datos clientes cargados:", self.maestros.clientes)

    def obtener_fabricacion(self) -> FabricacionDTO:
        with DB.crear_sesion() as session:
            ordenes = self.repo_ordenes_fabricacion.list_all(session)
            tipos = self.repo_tipos_producto.list_all(session)
            lineas = self.repo_lineas_fabricacion.list_all(session)
            traz_procesado = self.repo_trazabilidad_procesado.list_all(session)
            traz_fabricacion = self.repo_trazabilidad_fabricacion.list_all(session)
            traz_producto = self.repo_trazabilidad_producto.list_all(session)
            botas = self.repo_botas.list_all(session)

            self.fabricacion.ordenes_fabricacion = {
                orden.id: OrdenFabricacionDTO.from_db(orden) for orden in ordenes
            }
            self.fabricacion.tipos_producto = {
                tipo.id: TipoProductoDTO.from_db(tipo) for tipo in tipos
            }
            self.fabricacion.lineas_fabricacion = {
                linea.id: LineaFabricacionDTO.from_db(linea) for linea in lineas
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
            
            setattr(DTO, campo, valor)
            updated = DTO.to_db()
            repo.update(session, updated)

            maestro[entrada_id] = DTO
            logger.info(f"Entrada ID {entrada_id} modificada: {campo} = {valor}")
            return  {"id": entrada_id, "campo": campo, "valor": valor}


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

            objeto_DTO = objeto(id=0, **data)
            objeto_DB = objeto_DTO.to_db()
            objeto_DB.id = None  # Asegura que el ID sea None para la inserción
            new = repo.insert(session, objeto_DB)
            objeto_DTO = objeto.from_db(new)
            maestro[new.id] = objeto_DTO

            logger.info(f"Insertado ID {new.id} en la tabla {tabla}")
          
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
    def listar_ordenes_fabricacion(self, año: int | None = None):
        with DB.crear_sesion() as session:
            statement = select(OrdenFabricacionDB)
            if año:
                statement = statement.where(extract("year", OrdenFabricacionDB.fecha) == año)
            ordenes = session.exec(statement).all()
            return [OrdenFabricacionDTO.from_db(orden) for orden in ordenes]

    def listar_lineas_fabricacion(self, orden_id: int):
        with DB.crear_sesion() as session:
            statement = select(LineaFabricacionDB).where(LineaFabricacionDB.orden_id == orden_id)
            lineas = session.exec(statement).all()
            return [LineaFabricacionDTO.from_db(linea) for linea in lineas]

    def listar_trazabilidad_fabricacion(self, linea_fabricacion_id: int):
        with DB.crear_sesion() as session:
            statement = select(TrazabilidadFabricacionDB).where(
                TrazabilidadFabricacionDB.linea_fabricacion_id == linea_fabricacion_id
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
                    "linea_fabricacion_id": t.linea_fabricacion_id,
                    "palet_id": t.palet_id,
                    "palet_codigo": palet_map.get(t.palet_id),
                    "cantidad_fabricada": t.cantidad_fabricada,
                    "estado": t.estado,
                }
                for t in trazas
            ]

    def agregar_trazabilidad_fabricacion(self, data):
        linea_fabricacion_id = data.get("linea_fabricacion_id")
        palet_codigo = (data.get("palet_codigo") or "").strip()
        cantidad_fabricada = data.get("cantidad_fabricada")
        estado = data.get("estado", 0)

        if not linea_fabricacion_id:
            raise ValueError("linea_fabricacion_id es obligatorio.")
        if not palet_codigo:
            raise ValueError("palet_codigo es obligatorio.")

        cantidad_val = int(cantidad_fabricada) if str(cantidad_fabricada).strip() else 0

        with DB.crear_sesion() as session:
            palet = session.exec(select(PaletDB).where(PaletDB.codigo == palet_codigo)).first()
            if not palet:
                palet = PaletDB(
                    codigo=palet_codigo,
                    linea_entrada_id=None,
                    ubicacion_id=None,
                    procesado=False,
                )
                session.add(palet)
                session.commit()
                session.refresh(palet)
                if self.maestros.palets is not None:
                    self.maestros.palets[palet.id] = PaletDTO.from_db(palet)

            existente = session.exec(
                select(TrazabilidadFabricacionDB).where(
                    TrazabilidadFabricacionDB.linea_fabricacion_id == linea_fabricacion_id,
                    TrazabilidadFabricacionDB.palet_id == palet.id,
                )
            ).first()
            if existente:
                raise ValueError("El palet ya esta asociado a esta linea de trazabilidad.")

            trazabilidad = TrazabilidadFabricacionDB(
                linea_fabricacion_id=linea_fabricacion_id,
                palet_id=palet.id,
                cantidad_fabricada=cantidad_val,
                estado=estado,
            )
            session.add(trazabilidad)
            session.commit()
            session.refresh(trazabilidad)

            return {
                "id": trazabilidad.id,
                "linea_fabricacion_id": linea_fabricacion_id,
                "palet_id": palet.id,
                "palet_codigo": palet.codigo,
                "cantidad_fabricada": trazabilidad.cantidad_fabricada,
                "estado": trazabilidad.estado,
            }

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
        fabricado_por_id = data.get("fabricado_por_id") or data.get("operario_id")
        if fabricado_por_id is not None:
            try:
                fabricado_por_id = int(fabricado_por_id)
            except (TypeError, ValueError):
                fabricado_por_id = None

        if not trazabilidad_ids:
            raise ValueError("No hay trazabilidades activas.")

        with DB.crear_sesion() as session:
            try:
                with session.begin():
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

                    base, sep = self._construir_codigo_base(palet_codigos)
                    codigo = self._generar_codigo_producto(session, base, sep)
                    logger.info("Etiqueta fabricacion: codigo=%s origenes=%s", codigo, palet_codigos)

                    produccion_id = None
                    if trazas:
                        linea_ref = session.get(LineaFabricacionDB, trazas[0].linea_fabricacion_id)
                        if linea_ref:
                            produccion_id = linea_ref.orden_id
                    producto = ProductoDB(
                        tipo=tipo,
                        codigo=codigo,
                        produccion_id=produccion_id,
                        fabricado_por_id=fabricado_por_id,
                    )
                    session.add(producto)
                    session.flush()
                    session.refresh(producto)

                    for t in trazas:
                        session.add(TrazabilidadProductoDB(trazabilidad_fabricacion_id=t.id, producto_id=producto.id))
                        t.cantidad_fabricada = int(t.cantidad_fabricada or 0) + 1
                        session.add(t)

                    lineas_unicas = {t.linea_fabricacion_id for t in trazas}
                    for linea_id in lineas_unicas:
                        linea = session.get(LineaFabricacionDB, linea_id)
                        if linea:
                            linea.cantidad_fabricada = int(linea.cantidad_fabricada or 0) + 1
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
                target=self._imprimir_etiqueta_async,
                args=(codigo, palet_codigos, ws),
                daemon=True,
            ).start()

            return {"producto_id": producto.id, "codigo": producto.codigo}

    def _imprimir_etiqueta_async(self, codigo: str, origenes: list[str], ws=None):
        try:
            impresora = ImprimirEtiqueta()
            impresora.imprimir_etiqueta("botas", codigo, copies=1)
            try:
                import asyncio

                asyncio.run(
                    broadcast_event(
                        "async_print",
                        {"codigo": codigo, "origenes": origenes, "tipo": "botas"},
                        scope="cliente" if ws is not None else "all",
                        target_ws=ws,
                    )
                )
            except Exception:
                pass
        except Exception as exc:
            msg = f"Fallo al imprimir etiqueta {codigo} (origenes: {origenes}): {exc}"
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

    def _generar_codigo_producto(self, session, base: str, sep: str) -> str:
        like_pattern = f"{base}{sep}%"
        statement = select(ProductoDB.codigo).where(ProductoDB.codigo.like(like_pattern)).order_by(ProductoDB.codigo.desc())
        ultimo = session.exec(statement).first()
        if ultimo and sep in ultimo:
            try:
                suf = int(ultimo.rsplit(sep, 1)[1])
            except ValueError:
                suf = 0
        else:
            suf = 0
        siguiente = suf + 1
        return f"{base}{sep}{siguiente:03d}"
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
    #endregion

    #region Métodos Auxiliares
    def obtener_repo(self, tabla):
        if tabla == "clientes":
            repo = self.repo_clientes
            maestro = self.maestros.clientes
            objeto = ClienteDTO
        elif tabla == "estados":
            repo = self.repo_estados
            maestro = self.maestros.estados
            objeto = EstadoDTO
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
        elif tabla == "ordenes_fabricacion":
            repo = self.repo_ordenes_fabricacion
            maestro = self.fabricacion.ordenes_fabricacion
            objeto = OrdenFabricacionDTO
        elif tabla == "tipos_producto":
            repo = self.repo_tipos_producto
            maestro = self.fabricacion.tipos_producto
            objeto = TipoProductoDTO
        elif tabla == "lineas_fabricacion":
            repo = self.repo_lineas_fabricacion
            maestro = self.fabricacion.lineas_fabricacion
            objeto = LineaFabricacionDTO
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
    
    def checkUpdate(self, objeto, tabla, entrada_id, campo):
        if not objeto:
            raise ValueError(f"Entrada con ID {entrada_id} no encontrada en la tabla '{tabla}'.")
        if not hasattr(objeto, campo):
            raise ValueError(f"Campo '{campo}' no existe en la entrada de la tabla '{tabla}'.")

    def limpiar_datos(self):
        #self.datos.clear()
        pass
    #endregion
