#!/usr/bin/env bash
# Usage: deploy.sh <compose|k8s|helm> [image-tag]
set -euo pipefail
MODE="${1:-compose}"; TAG="${2:-latest}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
case "$MODE" in
  compose) docker compose -f "$ROOT/docker/docker-compose.yml" up -d --build ;;
  k8s)     kubectl apply -f "$ROOT/kubernetes/" ;
           kubectl -n shopstream set image deploy/shopstream app="${IMAGE_REPO:-shopstream}:$TAG" ;
           kubectl -n shopstream rollout status deploy/shopstream --timeout=120s ;;
  helm)    helm upgrade --install shopstream "$ROOT/helm/ecommerce" -n shopstream --create-namespace \
             --set image.repository="${IMAGE_REPO:-shopstream}" --set image.tag="$TAG" --wait --timeout 3m ;;
  *) echo "usage: $0 <compose|k8s|helm> [tag]"; exit 2 ;;
esac
