# Architecture
Layers: Development -> GitHub -> Jenkins (Build | Test | Security) -> Docker build -> Registry -> Kubernetes
(Deployment, Service, Ingress) -> Prometheus/Grafana (metrics) and Filebeat/ELK (logs) -> AI analysis.
Infrastructure underneath: Terraform provisions AWS (VPC, subnet, SG, EC2); Ansible hardens the host and installs Docker, k3s, Helm.

## Design decisions
- **k3s on one EC2 instance** instead of EKS: keeps cost near a few dollars/day for a student project; the manifests/Helm chart work unchanged on EKS (swap ingress class to the AWS/nginx controller).
- **Helm is the deploy path** from Jenkins; raw `kubernetes/` manifests are the readable reference and for `kubectl apply` demos.
- **Rolling update with maxUnavailable: 0** + readiness probes = zero-downtime releases; `helm rollback` on pipeline failure.
- **Metrics:** app exposes Prometheus metrics (latency histogram, orders counter, process stats). Alerts: AppDown, HighErrorRate, HighLatencyP95, HighMemory.
- **Logs:** app writes JSON lines to stdout -> Filebeat -> Logstash (parse) -> Elasticsearch -> Kibana.
- **Security in the pipeline:** npm audit, gitleaks, Trivy; runtime: non-root, read-only FS, dropped caps.
- **AI layer:** deterministic rules first (fast, offline, explainable), LLM enrichment optional.

## Git workflow
`main` (production) <- `develop` <- `feature/*`. PRs require review + passing CI (`.github/workflows/ci.yml`). Jenkins deploys only from `main`.
