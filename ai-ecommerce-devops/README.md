# AI-Powered E-Commerce DevOps & Cloud-Native Delivery Platform

A production-style delivery platform built around a small e-commerce app (**ShopStream**, Node.js/Express).
The focus is the DevOps ecosystem, not the app: Git workflow, Bash automation, Docker, Jenkins CI/CD,
Terraform + Ansible, Kubernetes + Helm, Prometheus/Grafana, ELK, DevSecOps, AI-assisted incident analysis.

```
GitHub -> Jenkins (build/test/scan) -> Docker image -> Registry -> Kubernetes (k3s on AWS EC2)
   Terraform (AWS infra) -> Ansible (server config)        Prometheus/Grafana + ELK -> AI incident analysis
```

## Repository map
| Folder | What's in it |
|---|---|
| `application/` | ShopStream app: `/health`, `/ready`, `/metrics`, `/api/products`, `/api/orders`, JSON logs, tests |
| `scripts/` | `setup`, `deploy`, `health-check`, `backup`, `cleanup`, `system-check` |
| `docker/` | multi-stage non-root `Dockerfile`, `docker-compose.yml` (nginx, app, postgres, prometheus, grafana) |
| `jenkins/` | `Jenkinsfile` (checkout -> deps -> build -> test -> security -> docker -> scan -> push -> deploy -> health) |
| `terraform/` | AWS VPC + security group + EC2, modules and per-environment tfvars |
| `ansible/` | roles `common` (hardening), `docker`, `k3s` (+Helm) |
| `kubernetes/` | namespace, deployment, service, configmap, secret template, ingress, HPA, canary + blue-green |
| `helm/ecommerce/` | the same resources as a Helm chart |
| `monitoring/` | Prometheus config + alert rules, Grafana provisioning + dashboard |
| `logging/elk/` | Filebeat -> Logstash -> Elasticsearch -> Kibana |
| `security/` | Trivy, gitleaks, scan and hardening scripts |
| `ai/incident-analysis/` | log classifier with severity, root cause, remediation; optional LLM enrichment |
| `docs/` | architecture, implementation, deployment, troubleshooting |

## Quick start (local, no cloud)
```bash
cd application && npm ci && npm test          # 5 tests
cd .. && docker compose -f docker/docker-compose.yml up -d --build
scripts/health-check.sh http://localhost:8080/health
# App http://localhost:8080 | Prometheus :9090 | Grafana :3001 (admin / admin_change_me)
```
Add logging: `docker compose -f docker/docker-compose.yml -f logging/elk/docker-compose.elk.yml up -d` -> Kibana :5601

## Cloud deployment (AWS) - see docs/deployment.md
`terraform apply` -> `ansible-playbook` -> `scripts/deploy.sh helm <tag>` (or let Jenkins do it).

## AI incident analysis
```bash
python3 ai/incident-analysis/analyze.py ai/incident-analysis/sample_logs/db_timeout.log
kubectl -n shopstream logs deploy/shopstream --tail=500 | python3 ai/incident-analysis/analyze.py -
```

## Placeholders you must change
`YOUR_DOCKERHUB_USER` (Jenkinsfile, k8s, helm), `admin_cidr` and `key_name` in `terraform/environments/*.tfvars`,
Grafana/DB passwords, `APP_URL` in the Jenkinsfile. Never commit real secrets.
