#!/bin/bash

# Script para ver la cola del log de Rathole en tiempo real

# Verifica si el usuario tiene permisos de superusuario
if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root o con sudo."
  exit 1
fi

# Comando para mostrar los logs en tiempo real
journalctl -u rathole-server -f -l