#!/usr/bin/env bash
# Run all local security checks (same ones the pipeline runs).
set -uo pipefail
cd "$(dirname "$0")/.."
rc=0
echo "== Dependency scan =="; (cd application && npm audit --audit-level=high --omit=dev) || rc=1
command -v gitleaks >/dev/null && { echo "== Secret scan =="; gitleaks detect --source . --config security/gitleaks.toml --no-banner || rc=1; } || echo "(gitleaks not installed - skipped)"
command -v trivy >/dev/null && { echo "== Image scan =="; docker build -q -f docker/Dockerfile -t shopstream:scan . && trivy image --config security/trivy.yaml --exit-code 1 shopstream:scan || rc=1; } || echo "(trivy not installed - skipped)"
exit $rc
