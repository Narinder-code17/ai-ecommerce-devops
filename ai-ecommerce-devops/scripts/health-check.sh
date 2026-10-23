#!/usr/bin/env bash
# Usage: health-check.sh [url]   exit 0 when healthy, 1 otherwise
URL="${1:-http://localhost:8080/health}"
for i in $(seq 1 ${RETRIES:-10}); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$URL" || true)
  if [[ "$code" == "200" ]]; then echo "OK ($URL) after $i attempt(s)"; exit 0; fi
  echo "attempt $i: HTTP $code"; sleep "${DELAY:-3}"
done
echo "UNHEALTHY: $URL"; exit 1
