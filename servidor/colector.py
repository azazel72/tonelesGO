import logging

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

    def limpiar_datos(self):
        #self.datos.clear()
        pass
