# Troubleshooting
| Symptom | Check |
|---|---|
| Pods `ImagePullBackOff` | image tag exists? registry creds / imagePullSecret? `kubectl describe pod` |
| Pods `CrashLoopBackOff` | `kubectl logs --previous`; missing env/secret; port mismatch |
| `OOMKilled` | raise memory limit; check Grafana memory panel |
| Rollout stuck | readiness probe failing -> `kubectl rollout status`, `helm rollback shopstream` |
| `/ready` returns 503 | DB unreachable: verify `DATABASE_URL`, DB health, network |
| Jenkins can't run docker | add `jenkins` user to `docker` group, restart Jenkins |
| Trivy fails build | upgrade base image/deps; use `--ignore-unfixed`; document accepted risk |
| Ingress 404 | `ingressClassName` must match controller (`traefik` on k3s) |
| Terraform: SSH blocked | `admin_cidr` must be your current public IP |
| Ansible: ufw module missing | `ansible-galaxy collection install community.general` |
Use `ai/incident-analysis/analyze.py` on the logs for a first-pass diagnosis.
