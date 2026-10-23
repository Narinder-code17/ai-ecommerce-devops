#!/usr/bin/env bash
# Basic Ubuntu hardening (manual alternative to the Ansible 'common' role).
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root"; exit 1; }
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/;s/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sshd -t && systemctl restart ssh
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
apt-get install -y fail2ban unattended-upgrades && systemctl enable --now fail2ban
echo "Hardening applied"
