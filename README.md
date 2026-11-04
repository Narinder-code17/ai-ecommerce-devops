# ShopStream — DevOps Automation & Cloud Deployment Platform

A containerized e-commerce application demonstrating practical DevOps and DevSecOps workflows using Docker, Docker Compose, PostgreSQL, Jenkins, GitHub Actions, AWS, Trivy, Prometheus, Grafana and CloudWatch.

ShopStream focuses on automating application delivery, securing deployment pipelines, maintaining persistent application data, implementing cloud infrastructure, monitoring application health and establishing reliable database backup and recovery procedures.

**Repository:** [Narinder-code17/ai-ecommerce-devops](https://github.com/Narinder-code17/ai-ecommerce-devops)

**Active Branch:** `develop`

---

## 1. Project Overview

ShopStream is a Node.js/Express-based e-commerce application supported by a DevOps and cloud deployment environment.

The project demonstrates how an application can be:

- Managed using Git and GitHub.
- Tested and validated through automated CI/CD pipelines.
- Containerized using Docker.
- Deployed using Docker Compose.
- Connected to PostgreSQL for persistent data storage.
- Scanned using Trivy and Gitleaks.
- Deployed to AWS EC2.
- Secured using HTTPS and IAM-based access control.
- Monitored using Prometheus, Grafana and Amazon CloudWatch.
- Protected through automated database backups to Amazon S3.
- Recovered using tested database restoration procedures.

The project includes both a local development environment and an AWS-hosted deployment.

## 2. Architecture

### 2.1 Overall Architecture

```text
                       Developer
                           |
                           v
                      Git / GitHub
                           |
              +------------+------------+
              |                         |
              v                         v
        GitHub Actions                Jenkins
              |
              v
       Build and Test
              |
       +------+------+
       |             |
       v             v
    Gitleaks       Trivy
       |             |
       +------+------+
              |
              v
       Docker Image
              |
              v
       AWS OIDC Login
              |
              v
       AWS Systems Manager
              |
              v
           AWS EC2
              |
          Apache
        HTTPS :443
              |
              v
       ShopStream API
        Docker :3000
              |
              v
          PostgreSQL
              |
       Persistent Volume
              |
              v
       Automated Backup
              |
              v
          Amazon S3

              AWS Monitoring
                    |
              Amazon CloudWatch
                    |
          +---------+----------+
          |                    |
          v                    v
       CloudWatch            SNS Email
         Alarms             Notifications

       Local Monitoring
              |
       +------+------+
       |             |
       v             v
   Prometheus      Grafana
       |
   PostgreSQL
    Exporter
```

### 2.2 Main Components

| Component | Responsibility |
|---|---|
| GitHub | Source-code management |
| GitHub Actions | Automated CI/CD workflow |
| Jenkins | Local application CI/CD pipeline |
| Docker | Application containerization |
| Docker Compose | Multi-container orchestration |
| Node.js / Express | Application API |
| PostgreSQL | Persistent database |
| Trivy | Container vulnerability scanning |
| Gitleaks | Secret detection |
| AWS EC2 | Cloud application hosting |
| Apache | Reverse proxy and HTTPS termination |
| AWS Systems Manager | Remote deployment execution |
| AWS IAM / OIDC | Secure access and authentication |
| Amazon S3 | Database backup storage |
| Amazon CloudWatch | Infrastructure and application monitoring |
| Amazon SNS | Email notifications |
| Prometheus | Metrics collection |
| PostgreSQL Exporter | Database metrics |
| Grafana | Monitoring dashboards |

## 3. Technology Stack

| Category | Technologies |
|---|---|
| Application | Node.js, Express.js |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Apache HTTP Server |
| CI/CD | Jenkins, GitHub Actions |
| Security | Trivy, Gitleaks, npm audit |
| Cloud Platform | AWS |
| Compute | Amazon EC2 |
| Storage | Amazon S3 |
| Deployment | AWS Systems Manager |
| Authentication | AWS IAM, GitHub OIDC |
| HTTPS | Let's Encrypt, Certbot |
| Monitoring | Amazon CloudWatch, Prometheus |
| Visualization | Grafana |
| Notifications | Amazon SNS |
| Version Control | Git, GitHub |
| Scripting / CLI | Windows PowerShell, Linux Shell |

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
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|
|-- Jenkinsfile
|
`-- README.md
```

Additional development and deployment configuration files may exist in the repository.

## 5. Application Features

ShopStream provides application endpoints for health monitoring, readiness verification and order management.

### Health Endpoint

```http
GET /health
```

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

Creates a new order.

Order information is stored in PostgreSQL.

### Products API

```http
GET /api/products
```

Retrieves available products from the application.

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

A named Docker volume maintains PostgreSQL data across normal container restarts and recreation.

### Database Validation

The application was tested by:

- Creating and retrieving orders.
- Restarting the PostgreSQL container.
- Verifying that existing records remained available.
- Restoring a backup into a separate temporary database.

**Latest verified live database count: 6 orders.**

Database persistence was successfully verified after restarting the PostgreSQL container.

## 7. Local Docker Compose Setup

### Prerequisites

- Windows 10/11 or another supported operating system.
- Docker Desktop.
- Git.
- Node.js and npm for local testing.

### Clone the Repository

```powershell
git clone https://github.com/Narinder-code17/ai-ecommerce-devops.git

cd ai-ecommerce-devops

git checkout develop
```

### Validate Docker Compose Configuration

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml config --quiet
```

### Build and Start the Application

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml up -d --build
```

### Verify Running Containers

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml ps
```

### View Container Logs

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml logs -f
```

### Stop the Environment

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml down
```

The normal `down` command preserves named PostgreSQL volumes. Do not add `-v` unless you intentionally want to remove persistent database storage.

## 8. Local Application Access

The local development configuration uses the following endpoints:

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

Jenkins is managed separately from the ShopStream Compose application stack in the local setup.

## 9. Jenkins CI/CD Pipeline

The project includes a Jenkins pipeline for automating application delivery.

### Pipeline Stages

1. Checkout
2. Install Dependencies, Test and Audit
3. Build Docker Image
4. Trivy Security Scan
5. Docker Compose Diagnostics
6. Deploy
7. Health Check

### Pipeline Objectives

- Retrieve source code.
- Install dependencies.
- Execute automated application tests.
- Perform npm audit.
- Build Docker images.
- Scan images using Trivy.
- Validate Docker Compose configuration.
- Deploy the application.
- Verify application health.

### Jenkins Access

```text
http://localhost:8080
```

Configured Jenkins job:

```text
ShopStream-CI-CD
```

## 10. GitHub Actions CI/CD

GitHub Actions automates the build, testing, security scanning and AWS deployment workflow.

The workflow is configured in:

```text
.github/workflows/ci.yml
```

### Workflow Stages

**1. Build, Test and Security Scan**

- Checkout repository.
- Configure Node.js 20.
- Install dependencies.
- Run application tests.
- Execute npm audit.
- Scan for exposed secrets using Gitleaks.
- Build the Docker image.
- Perform Trivy security scanning.

**2. Deploy to AWS EC2**

- Authenticate with AWS using GitHub OIDC.
- Assume the configured IAM deployment role.
- Execute deployment commands through AWS Systems Manager.
- Deploy the application to the EC2 instance.
- Perform application health verification.

Deployment is configured for pushes to the `develop` branch.

### Latest Verified GitHub Actions Run

```text
Workflow: ci
Run: #25
Commit: 5dace8a
Branch: develop
Commit Message: Remove temporary OIDC debugging step

Build, Test and Security Scan: SUCCESS
Deploy to AWS EC2: SUCCESS

Total Workflow Duration: 1 minute
Gitleaks: No leaks detected
Overall Result: SUCCESS
```

View workflow execution:

[GitHub Actions — ShopStream](https://github.com/Narinder-code17/ai-ecommerce-devops/actions)

## 11. AWS EC2 Deployment

ShopStream is deployed on an Amazon EC2 instance.

### Infrastructure Details

| Configuration | Value |
|---|---|
| AWS Region | ap-south-1 (Mumbai) |
| Instance Name | ShopStream-Server |
| Instance Type | t3.micro |
| Operating System | Amazon Linux |
| Storage | 8 GB gp3 |
| Elastic IP | 13.205.31.41 |
| Application Port | 3000 (internal) |
| Database | PostgreSQL |
| Web Server | Apache HTTP Server |

### Deployment Architecture

The EC2 instance hosts the ShopStream application using Docker containers.

The application is accessible through Apache, which acts as a reverse proxy and forwards incoming requests to the application running on the local container port.

PostgreSQL runs in a separate container and stores application data using persistent Docker storage.

### Application Verification

The following endpoints were successfully verified:

```text
https://13.205.31.41/
https://13.205.31.41/health
```

Health endpoint response:

```json
{
  "status": "ok"
}
```

The application and database containers were also verified as healthy.

## 12. HTTPS Configuration and SSL Certificate

HTTPS was configured using Apache HTTP Server, Let's Encrypt and Certbot.

### Implementation

- Installed Apache SSL support.
- Configured Apache as a reverse proxy.
- Obtained a Let's Encrypt certificate for the Elastic IP address.
- Configured the certificate and private key in the Apache SSL virtual host.
- Configured HTTP-to-HTTPS redirection.
- Preserved the ACME challenge path for certificate renewal.
- Configured automated Certbot renewal using systemd.

### Certificate Paths

```text
Certificate:
/etc/letsencrypt/live/13.205.31.41/fullchain.pem

Private Key:
/etc/letsencrypt/live/13.205.31.41/privkey.pem
```

### HTTPS Verification

The following checks were completed:

- Apache configuration validation.
- HTTPS certificate verification.
- HTTP-to-HTTPS redirection.
- Application health endpoint over HTTPS.
- Certbot renewal dry-run.

The certificate uses Let's Encrypt's short-lived IP certificate profile. Its validity is approximately 160 hours, so automated renewal is essential.

### Automated Renewal

A custom systemd service and timer were configured to check certificate renewal every 12 hours.

```bash
sudo systemctl status certbot-renew.timer
```

Renewal simulation:

```bash
sudo certbot renew --dry-run
```

The renewal dry-run completed successfully.

## 13. AWS Security Implementation

Security was implemented across the EC2 instance, network configuration, IAM permissions and CI/CD pipeline.

### 13.1 EC2 Security Group

The security group `ShopStream-SG` uses the following inbound rules:

| Port | Protocol | Purpose |
|---|---|---|
| 22 | TCP | SSH administration |
| 80 | TCP | HTTP and ACME challenge |
| 443 | TCP | HTTPS application access |

SSH access is restricted to the authorized public IP address.

The application and PostgreSQL ports are not directly exposed to the public internet.

### 13.2 IAM Roles

Two main IAM roles are configured.

**ShopStreamEC2S3BackupRole**

Attached to the EC2 instance to support:

- Systems Manager access.
- CloudWatch Agent operation.
- S3 database backup operations.

The custom S3 policy is scoped to the ShopStream backup bucket.

**ShopStreamGitHubActionsDeployRole**

Used by GitHub Actions to authenticate with AWS through OpenID Connect.

The role is restricted to the ShopStream GitHub repository and the `develop` branch.

Its permissions support deployment through AWS Systems Manager.

### 13.3 GitHub OIDC Authentication

GitHub Actions uses OpenID Connect to obtain temporary AWS credentials.

This avoids storing long-lived AWS access keys in GitHub repository secrets.

The deployment workflow uses:

```text
GitHub Actions
      |
      v
GitHub OIDC Provider
      |
      v
AWS IAM Role
      |
      v
AWS Systems Manager
      |
      v
EC2 Deployment
```

### 13.4 IMDSv2

The EC2 instance is configured to require Instance Metadata Service Version 2 (IMDSv2), adding protection to instance metadata access.

## 14. AWS Database Backup and Recovery

Automated PostgreSQL backups are configured using a shell script, systemd timer and Amazon S3.

### Backup Configuration

| Component | Configuration |
|---|---|
| Database | PostgreSQL |
| Backup Format | PostgreSQL custom dump |
| Backup Script | `/usr/local/bin/shopstream-backup.sh` |
| Storage | Amazon S3 |
| S3 Bucket | `shopstream-db-backups-nk-2026` |
| Backup Schedule | Daily at 02:00 UTC |
| Local Retention | 7 days |

### Backup Architecture

```text
       PostgreSQL Database
                |
                v
       Backup Shell Script
                |
                v
        PostgreSQL Dump
                |
                v
       Amazon S3 Bucket
                |
                v
       Backup Retention
```

The S3 bucket is private and configured with:

- Block Public Access.
- Bucket versioning.
- Server-side encryption using S3-managed keys.

### Backup Verification

Successful database backup uploads to S3 were verified.

### Recovery Testing

A backup was restored into a separate temporary PostgreSQL database named:

```text
shop_restore_test
```

The restored database was inspected successfully.

The temporary recovery database was removed after testing, while the live application database remained intact.

The live database was verified to contain six orders.

The backup contained two orders because it was created before four subsequent orders were added. This confirmed that the restored database represented the backup's point-in-time state.

### Backup Schedule Verification

```bash
sudo systemctl status shopstream-backup.timer
```

The backup timer is enabled and configured for daily execution.

## 15. AWS CloudWatch Monitoring

Amazon CloudWatch is used to monitor the EC2 infrastructure and application health.

The CloudWatch Agent collects system-level metrics and publishes them under the custom namespace:

```text
ShopStream/EC2
```

### Collected Metrics

| Metric | Description |
|---|---|
| CPUUtilization | EC2 CPU utilization |
| mem_used_percent | Memory usage percentage |
| mem_available | Available system memory |
| disk_used_percent | Root filesystem disk usage |
| ShopStreamApplicationHealth | Application health status |

The memory and disk metrics are collected through the CloudWatch Agent.

### CloudWatch Alarms

Five CloudWatch alarms are configured.

| Alarm | Condition | Evaluation |
|---|---|---|
| ShopStream-High-CPU | CPU above 70% | 2 datapoints within 10 minutes |
| ShopStream-High-Memory | Memory above 80% | 2 datapoints within 10 minutes |
| ShopStream-High-Disk | Disk usage above 80% | 2 datapoints within 10 minutes |
| ShopStream-App-Down | Application health below 1 | 2 datapoints within 2 minutes |
| ShopStream-EC2-Status-Failed | EC2 status check failure | 2 datapoints within 2 minutes |

All five alarm notification actions were verified to use the configured SNS topic.

## 16. Amazon SNS Email Notifications

Amazon Simple Notification Service (SNS) is integrated with CloudWatch alarms to deliver email notifications.

### Notification Flow

```text
       EC2 / Application
                |
                v
         CloudWatch
                |
                v
         CloudWatch Alarm
                |
                v
              SNS
                |
                v
         Email Notification
```

The SNS topic is:

```text
ShopStream-CPU-Alert
```

The email subscription was confirmed.

A direct SNS test message was successfully published, and receipt of the test email was confirmed.

## 17. Local Monitoring with Prometheus

Prometheus collects application and database metrics in the local monitoring environment.

### Configured Scrape Jobs

| Job | Target |
|---|---|
| prometheus | localhost:9090 |
| shopstream | app:3000 |
| postgres | postgres-exporter:9187 |

The configured scrape interval is 15 seconds.

Prometheus is exposed locally on port `9095`.

### Verify Targets

```text
http://localhost:9095/targets
```

The expected targets are:

- prometheus
- shopstream
- postgres

A healthy target is displayed with the state `UP`.

### PostgreSQL Health Query

```promql
pg_up{job="postgres"}
```

A value of `1` indicates that the PostgreSQL exporter successfully connects to the database.

## 18. PostgreSQL Exporter

The PostgreSQL exporter exposes database metrics to Prometheus.

Its internal endpoint is:

```text
postgres-exporter:9187
```

The monitoring setup includes PostgreSQL active-connection metrics.

The exporter helps monitor database activity without requiring the application to expose database-specific metrics itself.

## 19. Grafana Dashboard

The project includes a provisioned dashboard named:

**ShopStream Overview**

Access:

```text
http://localhost:3005/d/shopstream-overview
```

### Dashboard Panels

| Panel | Purpose |
|---|---|
| Application availability | Application scrape availability |
| Orders created (1h) | Recent order activity |
| Request rate | Application request rate |
| Requests by status | HTTP status distribution |
| p95 latency | 95th-percentile response latency |
| CPU usage | Application process CPU usage |
| Memory (RSS) | Application resident memory |
| PostgreSQL Active Connections | Active database connections |

The dashboard uses Prometheus as its data source.

### Dashboard Provisioning

```text
monitoring/grafana/dashboards/shopstream-overview.json
```

Dashboard changes should be maintained in the JSON source file when using provisioning.

## 20. Prometheus Alert Rules

Six Prometheus alert rules are configured in the local monitoring environment.

| Alert | Condition | Duration | Severity |
|---|---|---|---|
| AppDown | Application target unavailable | 1 minute | Critical |
| HighErrorRate | HTTP 5xx error rate exceeds 5% | 5 minutes | Warning |
| HighLatencyP95 | p95 latency exceeds 1 second | 5 minutes | Warning |
| HighMemory | Application RSS exceeds 200 MiB | 10 minutes | Warning |
| PostgreSQLDown | Database connection failure | 1 minute | Critical |
| PostgreSQLExporterDown | Exporter scrape failure | 1 minute | Critical |

### Validate Alert Rules

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

### Controlled Alert Test

The PostgreSQL exporter-down alert was tested by temporarily stopping only the exporter.

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml `
  stop postgres-exporter
```

After the configured evaluation period, the alert was observed in the `firing` state.

The exporter was restarted after testing:

```powershell
docker compose `
  -f docker/docker-compose.yml `
  -f docker/docker-compose.override.yml `
  start postgres-exporter
```

## 21. Testing and Validation

The following validations were recorded during project implementation.

| Validation | Observed Result |
|---|---|
| Application unit tests | Previously recorded: 5/5 passed |
| npm audit | Previously recorded: 0 vulnerabilities in that run |
| Docker Compose validation | Successful |
| PostgreSQL persistence | Verified after container restart |
| Live PostgreSQL order count | 6 orders |
| Application health | `status: ok` |
| Application readiness | `status: ready` |
| Prometheus targets | All three targets observed UP |
| PostgreSQL health metric | `pg_up = 1` |
| Prometheus rule validation | Six rules found |
| Exporter failure test | Alert reached firing |
| Exporter recovery | Container restarted successfully |
| AWS EC2 deployment | Successful |
| HTTPS certificate verification | Successful |
| HTTP-to-HTTPS redirection | Successful |
| Certbot renewal simulation | Successful |
| S3 backup uploads | Successful |
| Database restore test | Successful |
| CloudWatch alarms | Five configured and actions verified |
| SNS email test | Email received |
| GitHub Actions Run #25 | Both jobs successful |
| Gitleaks | No leaks detected in latest workflow |
| Git repository | Latest workflow cleanup pushed to develop |

These results describe the recorded test runs and environment. They are not a guarantee that every future build or deployment will produce identical results.

## 22. Git Workflow

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

The GitHub Actions workflow automatically validates pushes to the configured branch.

## 23. Configuration and Security Notes

Before using the project in a production environment:

- Use strong database credentials.
- Never commit `.env` files or actual secrets.
- Keep SSH access restricted to authorized IP addresses.
- Avoid exposing internal application and database ports.
- Review IAM permissions regularly.
- Maintain HTTPS certificate renewal.
- Review Trivy vulnerability findings.
- Monitor CloudWatch alarms and application availability.
- Verify S3 backup uploads and restoration procedures.
- Protect Grafana and Prometheus access.
- Review log retention and access policies.
- Monitor AWS costs and resource usage.

The EC2 deployment is a practical cloud DevOps demonstration and should not automatically be considered production-hardened.

## 24. Future Enhancements

Possible improvements include:

- Infrastructure provisioning using Terraform.
- Configuration management using Ansible.
- Kubernetes deployment.
- Helm-based application deployment.
- Centralized logging using the ELK stack.
- Advanced application performance monitoring.
- Additional automated disaster recovery testing.
- Improved runtime container security.
- Automated infrastructure compliance checks.
- Integration with additional incident notification channels.

These are potential extensions and are not represented as completed features.

## 25. Author

**Narinder Kumar**

GitHub: [Narinder-code17](https://github.com/Narinder-code17)

Project Repository:

[AI E-Commerce DevOps Platform](https://github.com/Narinder-code17/ai-ecommerce-devops)

---

**ShopStream — Automate. Deploy. Monitor. Secure. Recover.**s