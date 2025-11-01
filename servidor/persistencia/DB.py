import mysql.connector
from sqlmodel import create_engine, Session

class Utils:

    @staticmethod
    def crear_conexion(host: str = "localhost", user: str = "root", password: str = "", database: str = "mi_bd"):
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            charset="utf8mb4"
        )

        return conn
    
    @staticmethod
    def crear_sesion(url: str = "mysql+mysqlconnector://root:tu_password@localhost/mi_bd?charset=utf8mb4"):
        DATABASE_URL = url
        engine = create_engine(DATABASE_URL, echo=False)
        return Session(engine)
