#!/usr/bin/env bash
set -euo pipefail

VPS_BIND_PORT="${VPS_BIND_PORT:-2333}"
PUBLIC_PORT="${PUBLIC_PORT:-5001}"
TOKEN="${TOKEN:-8f2d6b41c9a74f2bb03f0b8e5c4d91aa}"
INSTALL_DIR="${INSTALL_DIR:-/opt/rathole}"
CONFIG_DIR="${CONFIG_DIR:-/etc/rathole}"
SERVICE_NAME="${SERVICE_NAME:-rathole-server}"

log() {
  printf '[rathole] %s\n' "$1"
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "Ejecuta este script con sudo." >&2
    exit 1
  fi
}

detect_asset() {
  local arch
  arch="$(uname -m)"
  case "${arch}" in
    x86_64) echo "rathole-x86_64-unknown-linux-gnu.zip" ;;
    aarch64|arm64) echo "rathole-aarch64-unknown-linux-gnu.zip" ;;
    *)
      echo "Arquitectura no soportada: ${arch}" >&2
      exit 1
      ;;
  esac
}

download_rathole() {
  local asset zip_path url
  asset="$(detect_asset)"
  zip_path="${INSTALL_DIR}/rathole.zip"
  url="https://github.com/rathole-org/rathole/releases/latest/download/${asset}"

  mkdir -p "${INSTALL_DIR}" "${CONFIG_DIR}"

  log "Instalando dependencias..."
  apt-get update
  apt-get install -y curl unzip

  log "Descargando rathole..."
  curl -L "${url}" -o "${zip_path}"

  log "Descomprimiendo..."
  unzip -o "${zip_path}" -d "${INSTALL_DIR}"

  install -m 755 "${INSTALL_DIR}/rathole" /usr/local/bin/rathole
}

write_config() {
  cat > "${CONFIG_DIR}/server.toml" <<EOF
[server]
bind_addr = "0.0.0.0:${VPS_BIND_PORT}"

[server.services.ws5001]
token = "${TOKEN}"
bind_addr = "0.0.0.0:${PUBLIC_PORT}"
EOF
}

write_service() {
  cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Rathole Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/rathole ${CONFIG_DIR}/server.toml
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
}

configure_ufw() {
  if command -v ufw >/dev/null 2>&1; then
    log "Abriendo puertos en ufw..."
    ufw allow "${VPS_BIND_PORT}/tcp"
    ufw allow "${PUBLIC_PORT}/tcp"
  fi
}

start_service() {
  systemctl daemon-reload
  systemctl enable --now "${SERVICE_NAME}"
  systemctl status "${SERVICE_NAME}" --no-pager || true
}

require_root
download_rathole
write_config
write_service
configure_ufw
start_service

log "Configuracion creada en ${CONFIG_DIR}/server.toml"
cat "${CONFIG_DIR}/server.toml"
log "Logs: journalctl -u ${SERVICE_NAME} -f"
