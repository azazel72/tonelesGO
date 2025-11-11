import logging

from servidor.conexiones.response_message import ResponseMessage

from .modelos import ClienteDB, EstadoDB, InstalacionDB, UbicacionDB, ProveedorDB, UsuarioDB
from .modelos import PlanCamionesDB, PlanFacturacionDB, PlanMaterialDB
from .persistencia import GenericRepository, DB
from .dominio import EntradasDTO, MaestrosDTO
from .dominio import ClienteDTO, EstadoDTO, InstalacionDTO, UbicacionDTO, ProveedorDTO, UsuarioDTO

logger = logging.getLogger("paezlobato_colector")

class Colector:

    colector: "Colector" = None
    entradas: "EntradasDTO" = None
    maestros: "MaestrosDTO" = None

    def __init__(self):
        Colector.colector = self
        self.entradas = EntradasDTO()
        self.maestros = MaestrosDTO()

        self.repo_facturacion = GenericRepository(PlanFacturacionDB)
        self.repo_camiones = GenericRepository(PlanCamionesDB)
        self.repo_materiales = GenericRepository(PlanMaterialDB)

        self.repo_clientes = GenericRepository(ClienteDB)
        self.repo_estados = GenericRepository(EstadoDB)
        self.repo_instalaciones = GenericRepository(InstalacionDB)
        self.repo_ubicaciones = GenericRepository(UbicacionDB)
        self.repo_proveedores = GenericRepository(ProveedorDB)

        self.repo_usuarios = GenericRepository(UsuarioDB)


    def obtener_datos_maestros(self) -> dict:
        with DB.crear_sesion() as session:
            clientes = self.repo_clientes.list_all(session)
            estados = self.repo_estados.list_all(session)
            instalaciones = self.repo_instalaciones.list_all(session)
            ubicaciones = self.repo_ubicaciones.list_all(session)
            proveedores = self.repo_proveedores.list_all(session)
            usuarios = self.repo_usuarios.list_all(session)

            self.maestros.clientes = {cliente.id: ClienteDTO.from_db(cliente) for cliente in clientes}
            self.maestros.estados = {estado.id: EstadoDTO.from_db(estado) for estado in estados}
            self.maestros.instalaciones = {instalacion.id: InstalacionDTO.from_db(instalacion) for instalacion in instalaciones}
            self.maestros.ubicaciones = {ubicacion.id: UbicacionDTO.from_db(ubicacion) for ubicacion in ubicaciones}
            self.maestros.proveedores = {proveedor.id: ProveedorDTO.from_db(proveedor) for proveedor in proveedores}
            self.maestros.usuarios = {usuario.id: UsuarioDTO.from_db(usuario) for usuario in usuarios}

            #print("Datos maestros cargados:", self.maestros)
            #print("Datos clientes cargados:", self.maestros.clientes)


    def obtener_entradas(self, año: int) -> EntradasDTO:
        with DB.crear_sesion() as session:
            plan_camiones = self.repo_camiones.list_by_year(session, año)
            plan_facturacion = self.repo_facturacion.list_by_year(session, año)
            plan_materiales = self.repo_materiales.list_by_year(session, año)

            return EntradasDTO(
                año=año,
                plan_camiones=plan_camiones,
                plan_facturacion=plan_facturacion[0] if plan_facturacion else None,
                plan_materiales=plan_materiales
            )
        
    def agregar_entradas_proveedores(self, año: int) -> EntradasDTO:
        with DB.crear_sesion() as session:
            plan_camiones = self.repo_camiones.list_by_year(session, año)
            proveedores = self.repo_proveedores.list_all(session)

            plan_proveedores_ids = {pc.proveedor_id for pc in plan_camiones if pc.proveedor_id is not None}
            proveedores_faltantes = [p for p in proveedores if p.id not in plan_proveedores_ids]

            logger.info(f"Proveedores faltantes para el año {año}: {[p.nombre for p in proveedores_faltantes]}")
            nuevas = [PlanCamionesDB(proveedor_id=p.id, año=año) for p in proveedores_faltantes]
            self.repo_camiones.insert_all(session, nuevas)
            try:
                session.commit()
            except Exception:
                session.rollback()
                raise
            logger.info("Entradas de proveedores agregadas correctamente.")
            return self.obtener_entradas(año)

    def limpiar_datos(self):
        #self.datos.clear()
        pass

    def modificar_entrada(self, data):
        tabla = data.get("tabla")
        entrada_id = data.get("id")
        campo = data.get("campo")
        valor = data.get("valor")
        objeto = None

        with DB.crear_sesion() as session:
            if tabla == "entradas":
                repo = self.repo_camiones
            else:
                raise ValueError(f"Tabla '{tabla}' no reconocida.")
            
            objeto = repo.get(session, entrada_id)
            if not objeto:
                raise ValueError(f"Entrada con ID {entrada_id} no encontrada en la tabla '{tabla}'.")
            
            if not hasattr(objeto, campo):
                raise ValueError(f"Campo '{campo}' no existe en la entrada de la tabla '{tabla}'.")
            
            setattr(objeto, campo, valor)
            repo.update(session, objeto)

            try:
                session.commit()
            except Exception:
                session.rollback()
                raise

            #Actualizado en memoria
            if tabla == "entradas":
                self.maestros.camiones[entrada_id] = CamionDTO.from_db(objeto)

            logger.info(f"Entrada ID {entrada_id} modificada: {campo} = {valor}")
          
            return ResponseMessage.ok("modificar_maestro", {"id": entrada_id, "campo": campo, "valor": valor}).model_dump()


    def modificar_maestro(self, data):
        tabla = data.get("tabla")
        entrada_id = data.get("id")
        campo = data.get("campo")
        valor = data.get("valor")
        objeto = None

        with DB.crear_sesion() as session:
            if tabla == "clientes":
                repo = self.repo_clientes
            elif tabla == "estados":
                repo = self.repo_estados
            elif tabla == "instalaciones":
                repo = self.repo_instalaciones
            elif tabla == "ubicaciones":
                repo = self.repo_ubicaciones
            elif tabla == "proveedores":
                repo = self.repo_proveedores
            elif tabla == "usuarios":
                repo = self.repo_usuarios
            else:
                raise ValueError(f"Tabla '{tabla}' no reconocida.")
            
            objeto = repo.get(session, entrada_id)
            if not objeto:
                raise ValueError(f"Entrada con ID {entrada_id} no encontrada en la tabla '{tabla}'.")
            
            if not hasattr(objeto, campo):
                raise ValueError(f"Campo '{campo}' no existe en la entrada de la tabla '{tabla}'.")
            
            setattr(objeto, campo, valor)
            repo.update(session, objeto)

            try:
                session.commit()
            except Exception:
                session.rollback()
                raise

            #Actualizado en memoria
            if tabla == "clientes":
                self.maestros.clientes[entrada_id] = ClienteDTO.from_db(objeto)
            elif tabla == "estados":
                self.maestros.estados[entrada_id] = EstadoDTO.from_db(objeto)
            elif tabla == "instalaciones":
                self.maestros.instalaciones[entrada_id] = InstalacionDTO.from_db(objeto)
            elif tabla == "ubicaciones":
                self.maestros.ubicaciones[entrada_id] = UbicacionDTO.from_db(objeto)
            elif tabla == "proveedores":
                self.maestros.proveedores[entrada_id] = ProveedorDTO.from_db(objeto)
            elif tabla == "usuarios":
                self.maestros.usuarios[entrada_id] = UsuarioDTO.from_db(objeto)

            logger.info(f"Entrada ID {entrada_id} modificada: {campo} = {valor}")
          
            return ResponseMessage.ok("modificar_maestro", {"id": entrada_id, "campo": campo, "valor": valor}).model_dump()
