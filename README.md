
# ShopStream — DevOps Automation & Monitoring Platform

A containerized e-commerce application built to demonstrate practical DevOps and DevSecOps workflows using Docker, Docker Compose, PostgreSQL, Jenkins, GitHub Actions, Trivy, Prometheus, and Grafana.

ShopStream focuses on automating application delivery, maintaining persistent application data, scanning container images, and monitoring application and database health.

**Repository:** [Narinder-code17/ai-ecommerce-devops](https://github.com/Narinder-code17/ai-ecommerce-devops)

**Active Branch:** `develop`

---

## 1. Project Overview

ShopStream is a Node.js/Express-based e-commerce application supported by a DevOps environment.

The project demonstrates how application code can be:

- Managed through Git and GitHub.
- Tested and validated through CI/CD pipelines.
- Packaged into Docker images.
- Deployed using Docker Compose.
- Connected to PostgreSQL for persistent data storage.
- Scanned using Trivy for security issues.
- Monitored using Prometheus and Grafana.
- Protected through Prometheus alert rules.

The current verified implementation runs locally using Docker Desktop and Docker Compose.

## 2. Architecture

```text
                 Developer
                     |
                     v
                GitHub Repo
                     |
          +----------+----------+
          |                     |
          v                     v
     GitHub Actions          Jenkins
          |                     |
          +----------+----------+
                     |
                     v
              CI/CD Validation
          Tests | npm audit | Trivy
                     |
                     v
               Docker Image
                     |
                     v
              Docker Compose
                     |
          +----------+-----------+
          |          |           |
          v          v           v
        Nginx     ShopStream   PostgreSQL
                    API          |
                     |           |
                     +-----+-----+
                           |
                     Persistent Data
                           |
          +----------------+----------------+
          |                                 |
          v                                 v
      Prometheus                      PostgreSQL
          |                            Exporter
          |                                 |
          +---------------+-----------------+
                          |
                          v
                       Grafana
                          |
                   Monitoring Dashboard
```

### Main components

| Component | Responsibility |
|---|---|
| GitHub | Source-code management and repository hosting |
| GitHub Actions | Automated repository CI workflow |
| Jenkins | Application CI/CD pipeline |
| Docker | Application containerization |
| Docker Compose | Multi-container service orchestration |
| Nginx | Reverse proxy |
| Node.js / Express | Application API |
| PostgreSQL | Persistent order storage |
| Trivy | Container security scanning |
| Prometheus | Metrics collection and alert evaluation |
| PostgreSQL Exporter | Database metrics collection |
| Grafana | Monitoring dashboards and visualization |

## 3. Technology Stack

| Category | Technologies |
|---|---|
| Application | Node.js, Express.js |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | Jenkins, GitHub Actions |
| Security | Trivy, npm audit |
| Monitoring | Prometheus |
| Database Monitoring | PostgreSQL Exporter |
| Visualization | Grafana |
| Version Control | Git, GitHub |
| Scripting / CLI | Windows PowerShell |

## 4. Repository Structure

```text
ai-ecommerce-devops/
|
|-- application/
|   |-- src/
|   |-- package.json
|   |-- package-lock.json
|   |-- Dockerfile
|   `-- tests/
|
|-- docker/
|   |-- Dockerfile
|   |-- docker-compose.yml
|   `-- docker-compose.override.yml
|
|-- monitoring/
|   |-- prometheus/
|   |   |-- prometheus.yml
|   |   `-- alerts.yml
|   |
|   `-- grafana/
|       |-- dashboards/
|       |   `-- shopstream-overview.json
|       `-- provisioning/
|
|-- Jenkinsfile
|
|-- .github/
|   `-- workflows/
|
`-- README.md
```

Additional experimental or development directories may exist in the repository. Their deployment and operational status should be evaluated separately before treating them as completed production features.

## 5. Application Features

### Health Endpoint

```http
GET /health
```

Returns application health information.

Example response:

```json
{
  "status": "ok"
}
```

### Readiness Endpoint

```http
GET /ready
```

Returns the application's readiness status.

Example response:

```json
{
  "status": "ready"
}
```

### Orders API

```http
GET /api/orders
```

Retrieves stored order records.

```http
POST /api/orders
```

Creates an order.

Order records are stored in PostgreSQL when database configuration is available.

### Metrics Endpoint

```http
GET /metrics
```

Exposes application metrics for Prometheus collection.

## 6. Database Persistence

ShopStream uses PostgreSQL for persistent order storage.

Database configuration is supplied through the `DATABASE_URL` environment variable.

Example connection format:

```text
postgres://shop:<DB_PASSWORD>@db:5432/shop
```

A named Docker volume called `pgdata` stores PostgreSQL data.

This allows database records to persist across normal container restarts and recreation.

The order API was verified to return five previously stored records during final project testing.

## 7. Docker Compose Setup

### Prerequisites

- Windows 10/11 or another supported operating system.
- Docker Desktop.
- Git.
- Node.js and npm for running application tests locally.

### Clone the repository

```powershell
git clone https://github.com/Narinder-code17/ai-ecommerce-devops.git

cd ai-ecommerce-devops

git checkout develop
```

### Validate Docker Compose configuration

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml config --quiet
```

### Build and start the application

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml up -d --build
```

### Verify running containers

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml ps
```

### View container logs

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml logs -f
```

### Stop the environment

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml down
```

The normal `down` command preserves the named PostgreSQL volume. Do not add `-v` unless you intentionally want to delete persistent database storage.

## 8. Application Access

After successfully starting the services, use these local URLs:

| Service | URL |
|---|---|
| ShopStream Application | http://localhost:8085 |
| Application Health | http://localhost:8085/health |
| Application Readiness | http://localhost:8085/ready |
| Orders API | http://localhost:8085/api/orders |
| Prometheus | http://localhost:9095 |
| Prometheus Targets | http://localhost:9095/targets |
| Prometheus Alerts | http://localhost:9095/alerts |
| Grafana | http://localhost:3005 |
| Jenkins | http://localhost:8080 |

Jenkins is managed separately from the ShopStream Compose application stack in the current local setup.

### Grafana Login

The local development configuration previously used:

```text
Username: admin
Password: admin_change_me
```

Change default credentials before exposing the environment to other users or deploying it publicly.

## 9. Jenkins CI/CD Pipeline

The project includes a Jenkins pipeline configured to automate application delivery.

### Pipeline stages

1. Checkout
2. Install Dependencies, Test and Audit
3. Build Docker Image
4. Trivy Security Scan
5. Docker Compose Diagnostics
6. Deploy
7. Health Check

### Pipeline objectives

- Retrieve the latest source code.
- Install required dependencies.
- Run automated application tests.
- Check dependencies using npm audit.
- Build the Docker image.
- Scan the image using Trivy.
- Validate Docker Compose configuration.
- Deploy the application.
- Verify application health.

### Jenkins access

```text
http://localhost:8080
```

The configured Jenkins job is:

```text
ShopStream-CI-CD
```

## 10. GitHub Actions

The GitHub repository also contains an automated CI workflow.

The workflow is used to validate repository changes when commits are pushed to the `develop` branch.

Latest recorded verification:

```text
Workflow: ci
Run: #20
Commit: cc7c76e
Branch: develop
Result: SUCCESS
```

View workflow execution:

[GitHub Actions — ShopStream](https://github.com/Narinder-code17/ai-ecommerce-devops/actions)

## 11. Security Scanning with Trivy

Trivy is integrated into the CI/CD workflow to scan the built Docker image.

The scan is intended to identify:

- Operating-system package vulnerabilities.
- Application dependency vulnerabilities.
- Exposed secrets.
- Other detected image security risks.

Security scans should be reviewed whenever the application image or dependencies change.

**Important:** A successful pipeline does not mean that every image is vulnerability-free. Findings and scan failures must be assessed using the actual output of each scan.

## 12. Monitoring with Prometheus

Prometheus collects metrics from three configured scrape jobs.

| Job | Target |
|---|---|
| prometheus | localhost:9090 |
| shopstream | app:3000 |
| postgres | postgres-exporter:9187 |

The configured scrape interval is 15 seconds.

Prometheus is exposed locally on port `9095`.

### Verify targets

Open:

```text
http://localhost:9095/targets
```

The expected jobs are:

- prometheus
- shopstream
- postgres

A healthy target is displayed with the state `UP`.

### PostgreSQL health query

```promql
pg_up{job="postgres"}
```

A value of `1` indicates that the PostgreSQL exporter successfully connects to the database.

## 13. PostgreSQL Exporter

The PostgreSQL exporter exposes database metrics to Prometheus.

Its internal endpoint is:

```text
postgres-exporter:9187
```

The monitoring setup includes PostgreSQL active-connection metrics.

The exporter helps monitor database activity without requiring the application to expose database-specific metrics itself.

## 14. Grafana Dashboard

The project includes a provisioned dashboard named:

**ShopStream Overview**

Access:

```text
http://localhost:3005/d/shopstream-overview
```

### Dashboard panels

| Panel | Purpose |
|---|---|
| Application availability | Displays application scrape availability |
| Orders created (1h) | Displays recent order activity |
| Request rate | Shows application request rate |
| Requests by status | Groups requests according to HTTP status |
| p95 latency | Displays the 95th-percentile response latency |
| CPU usage | Shows application process CPU usage |
| Memory (RSS) | Shows application resident memory |
| PostgreSQL Active Connections | Displays active database connections |

The dashboard uses Prometheus as its data source and refreshes periodically.

### Dashboard provisioning

The dashboard is provisioned from its JSON configuration:

```text
monitoring/grafana/dashboards/shopstream-overview.json
```

Because it is provisioned, persistent dashboard changes should be made in the JSON source file rather than relying on UI-only edits.

## 15. Prometheus Alert Rules

Six Prometheus alert rules are configured.

| Alert | Condition | Duration | Severity |
|---|---|---|---|
| AppDown | Application target is unavailable | 1 minute | Critical |
| HighErrorRate | HTTP 5xx error rate exceeds 5% | 5 minutes | Warning |
| HighLatencyP95 | p95 latency exceeds 1 second | 5 minutes | Warning |
| HighMemory | Application RSS exceeds 200 MiB | 10 minutes | Warning |
| PostgreSQLDown | PostgreSQL exporter reports database connection failure | 1 minute | Critical |
| PostgreSQLExporterDown | Prometheus cannot scrape the PostgreSQL exporter | 1 minute | Critical |

### Validate alert rules

Run:

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml `
  exec prometheus promtool check rules /etc/prometheus/alerts.yml
```

Recorded validation:

```text
Checking /etc/prometheus/alerts.yml

SUCCESS: 6 rules found
```

### Controlled alert test

The PostgreSQL exporter-down alert was tested by temporarily stopping only the exporter.

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml `
  stop postgres-exporter
```

After the configured one-minute evaluation period, the alert was observed in the `firing` state.

Restore the exporter immediately after testing:

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml `
  start postgres-exporter
```

Do not leave the exporter stopped after the test.

## 16. Testing and Validation

The following checks were recorded during project implementation:

| Validation | Observed Result |
|---|---|
| Application unit tests | Previously recorded: 5/5 passed |
| npm audit | Previously recorded: 0 vulnerabilities in that run |
| Docker Compose validation | Successful |
| PostgreSQL order retrieval | Five existing order records returned |
| Application health | `status: ok` |
| Application readiness | `status: ready` |
| Prometheus targets | All three targets observed UP |
| PostgreSQL health metric | `pg_up = 1` |
| Prometheus rule validation | Six rules found |
| Exporter failure test | `PostgreSQLExporterDown` reached firing |
| Exporter recovery | Container started successfully |
| GitHub Actions | Latest recorded CI run #20 passed |
| Git repository | Changes committed and pushed to develop |

These results describe the recorded test runs and environment. They should not be interpreted as a guarantee that every future build will produce identical results.

## 17. Git Workflow

The active development branch is:

```text
develop
```

Useful commands:

```powershell
git status

git add .

git commit -m "Describe your changes"

git push origin develop
```

The latest recorded monitoring and alert-rule commits are:

```text
279d528  Add PostgreSQL exporter and Grafana monitoring dashboard

cc7c76e  Add PostgreSQL availability alert rules
```

## 18. Configuration and Security Notes

The following items should be reviewed before any public or production deployment:

- Change default Grafana credentials.
- Use strong database passwords.
- Do not commit `.env` files or real secrets.
- Restrict exposed host ports.
- Use HTTPS for public deployments.
- Configure appropriate authentication and authorization.
- Review Trivy findings for every image build.
- Configure PostgreSQL backups and recovery procedures.
- Review Prometheus retention and monitoring access.
- Add Alertmanager if email or messaging notifications are required.

The present environment is a local development and demonstration setup.

## 19. Future Enhancements

Possible improvements include:

- Deploy ShopStream to AWS.
- Provision cloud infrastructure using Terraform.
- Configure server automation using Ansible.
- Deploy the application to Kubernetes.
- Introduce Helm-based deployment.
- Add Alertmanager notifications.
- Integrate centralized logging using the ELK stack.
- Add an AI-assisted incident analysis component.
- Introduce automated PostgreSQL backup and restore testing.
- Improve security policies and runtime hardening.

These are future or separately verifiable extensions; they should not be considered completed deployment features based solely on this report.

## 20. Author

**Narinder Kumar**

DevOps Engineering Project

Mangalore Institute of Technology and Engineering

GitHub: [Narinder-code17](https://github.com/Narinder-code17)

Project Repository:

[AI E-Commerce DevOps Platform](https://github.com/Narinder-code17/ai-ecommerce-devops)

---

**ShopStream — Automate. Deploy. Monitor. Improve.**
