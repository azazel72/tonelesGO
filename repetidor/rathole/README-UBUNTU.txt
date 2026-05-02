Uso rapido en Ubuntu VPS

1. Sube o copia esta carpeta al VPS.
2. Ejecuta:

sudo bash ./setup-server.sh

El script:
- instala rathole
- crea /etc/rathole/server.toml
- escucha el tunel en 2333
- publica el servicio en 5001
- crea el servicio systemd rathole-server
- abre ufw si esta instalado

Si quieres cambiar algo:

sudo TOKEN=8f2d6b41c9a74f2bb03f0b8e5c4d91aa VPS_BIND_PORT=2333 PUBLIC_PORT=5001 bash ./setup-server.sh

Comprobacion:

sudo systemctl status rathole-server --no-pager
sudo journalctl -u rathole-server -f

Firewall con ufw:

sudo ufw allow 2333/tcp
sudo ufw allow 5001/tcp
sudo ufw reload
