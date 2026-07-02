from servidor import herramientas

CADENA_CONEXION = "mysql+pymysql://rafa:rafa@localhost/antoniopaezlobato?charset=utf8mb4"
PUERTO_BD = 3306
NOMBRE_EQUIPO = herramientas.ConfiguracionSistema.getNombreEquipo()
print("Nombre de equipo:", NOMBRE_EQUIPO)

if (NOMBRE_EQUIPO == "DESKTOP-RAFAEL"):
    CADENA_CONEXION = "mysql+pymysql://root:@localhost/antoniopaezlobato?charset=utf8mb4"
    PUERTO_BD = herramientas.ConfiguracionMySQL.get_mysql_port_from_xampp()
elif (NOMBRE_EQUIPO != "SERVITEK-ASUS"):
    CADENA_CONEXION = "mysql+pymysql://rafa:rafa@localhost:3307/antoniopaezlobato?charset=utf8mb4"    
    PUERTO_BD = 3307
