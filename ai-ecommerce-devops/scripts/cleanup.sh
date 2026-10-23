#!/usr/bin/env bash
# Remove dangling docker objects and rotate old logs. Use --all to also stop the stack.
set -euo pipefail
docker system prune -f
find /var/log/shopstream -name '*.log' -mtime +14 -delete 2>/dev/null || true
if [[ "${1:-}" == "--all" ]]; then
  docker compose -f "$(dirname "$0")/../docker/docker-compose.yml" down -v
fi
echo "Cleanup done"
