import socket

class ConfiguracionSistema:

    def getNombreEquipo():
        return socket.gethostname()
    
    def getIPLocal():
        return socket.gethostbyname(socket.gethostname())
