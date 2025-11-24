from servidor import herramientas

CADENA_CONEXION = "mysql+mysqlconnector://rafa:rafa@localhost/paezlobato?charset=utf8mb4"
PUERTO_BD = 3306
NOMBRE_EQUIPO = herramientas.ConfiguracionSistema.getNombreEquipo()

if (NOMBRE_EQUIPO == "DESKTOP-RAFAEL"):
    CADENA_CONEXION = "mysql+mysqlconnector://root:@localhost/paezlobato?charset=utf8mb4"
    PUERTO_BD = herramientas.ConfiguracionMySQL.get_mysql_port_from_xampp()

