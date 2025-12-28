from datetime import date, timedelta
import logging
from typing import List

from servidor.herramientas.utilidades import obtener_anterior_dia_semana

from .modelos import ClienteDB, EstadoDB, InstalacionDB, UbicacionDB, ProveedorDB, UsuarioDB, RolDB, PuestoTrabajoDB, MaterialDB, DuelaDB, PedidoDB, LineaPedidoDB, PaletDB, ProductoDB
from .modelos import PlanCamionDB, PlanFacturacionDB, PlanMaterialDB, CuadranteDB, CuadranteDetalleDB
from .persistencia import GenericRepository, DB
from .dominio import EntradasDTO, MaestrosDTO, PlanMaterialDTO, PlanFacturacionDTO, PlanCamionDTO, CuadranteDTO, CuadranteDetalleDTO
from .dominio import ClienteDTO, EstadoDTO, InstalacionDTO, UbicacionDTO, ProveedorDTO, UsuarioDTO, RolDTO, PuestoTrabajoDTO, MaterialDTO, DuelaDTO, PedidoDTO, LineaPedidoDTO, PaletDTO, ProductoDTO, CuadrantesDTO

logger = logging.getLogger("paezlobato_colector")

class Colector:

    colector: "Colector" = None
    entradas: "EntradasDTO" = None
    maestros: "MaestrosDTO" = None
    cuadrantes: "CuadrantesDTO" = None


    def __init__(self):
        Colector.colector = self
        self.entradas = EntradasDTO()
        self.maestros = MaestrosDTO()
        self.cuadrantes = CuadrantesDTO()

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
        self.repo_pedidos = GenericRepository(PedidoDB)
        self.repo_lineas_pedido = GenericRepository(LineaPedidoDB)
        self.repo_palets = GenericRepository(PaletDB)
        self.repo_productos = GenericRepository(ProductoDB)

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
            pedidos = self.repo_pedidos.list_all(session)
            lineas_pedido = self.repo_lineas_pedido.list_all(session)
            palets = self.repo_palets.list_all(session)
            productos = self.repo_productos.list_all(session)

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
            self.maestros.pedidos = {pedido.id: PedidoDTO.from_db(pedido) for pedido in pedidos}
            self.maestros.lineas_pedido = {linea.id: LineaPedidoDTO.from_db(linea) for linea in lineas_pedido}
            self.maestros.palets = {palet.id: PaletDTO.from_db(palet) for palet in palets}
            self.maestros.productos = {producto.id: ProductoDTO.from_db(producto) for producto in productos}

            #print("Datos maestros cargados:", self.maestros)
            #print("Datos clientes cargados:", self.maestros.clientes)


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
    def obtener_entradas(self, año: int, actualizar_local = True) -> EntradasDTO:
        with DB.crear_sesion() as session:
            plan_camiones = self.repo_camiones.list_by_year(session, año)
            plan_facturacion = self.repo_facturacion.list_by_year(session, año)
            plan_materiales = self.repo_materiales.list_by_year(session, año)

            entradas_dto = EntradasDTO(
                año=año,
                plan_camiones=[PlanCamionDTO.from_db(pc) for pc in plan_camiones],
                plan_facturacion=PlanFacturacionDTO.from_db(plan_facturacion[0]) if plan_facturacion else None,
                plan_materiales=[PlanMaterialDTO.from_db(pm) for pm in plan_materiales]
            )
        
            if actualizar_local:
                self.entradas = entradas_dto

            return entradas_dto
        
    def agregar_entradas_proveedores(self, año: int) -> EntradasDTO:
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
            return self.obtener_entradas(año)

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
        elif tabla == "entradas":
            repo = self.repo_camiones
            maestro = self.entradas.buscar_camion_por_id
            objeto = PlanCamionDTO
        elif tabla == "materiales":
            repo = self.repo_materiales_maestro
            maestro = self.maestros.materiales
            objeto = MaterialDTO
        elif tabla == "duelas":
            repo = self.repo_duelas
            maestro = self.maestros.duelas
            objeto = DuelaDTO
        elif tabla == "pedidos":
            repo = self.repo_pedidos
            maestro = self.maestros.pedidos
            objeto = PedidoDTO
        elif tabla == "lineas_pedido":
            repo = self.repo_lineas_pedido
            maestro = self.maestros.lineas_pedido
            objeto = LineaPedidoDTO
        elif tabla == "palets":
            repo = self.repo_palets
            maestro = self.maestros.palets
            objeto = PaletDTO
        elif tabla == "productos":
            repo = self.repo_productos
            maestro = self.maestros.productos
            objeto = ProductoDTO
        elif tabla == "plan_materiales":
            repo = self.repo_materiales
            maestro = self.entradas.buscar_material_por_id
            objeto = PlanMaterialDTO
        elif tabla == "facturacion":
            repo = self.repo_facturacion
            maestro = self.entradas.buscar_facturacion_por_id
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