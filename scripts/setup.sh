#!/usr/bin/env bash
# Prepare a fresh Ubuntu host: base packages, Docker, repo dirs.
set -euo pipefail
log() { echo "[$(date +%FT%T)] $*"; }
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }
log "Installing base packages"
apt-get update -y && apt-get install -y curl git jq ca-certificates unzip
if ! command -v docker >/dev/null; then
  log "Installing Docker"; curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker
mkdir -p /var/log/shopstream /var/backups/shopstream
log "Setup complete"
