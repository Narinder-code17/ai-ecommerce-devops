# Implementation order (build it in this sequence and commit at each step)
1. **Git**: `git init`, branches `main`/`develop`, push to GitHub, protect `main`.
2. **Linux/Bash**: run `scripts/setup.sh` on Ubuntu; try `system-check.sh`.
3. **Docker**: `docker build -f docker/Dockerfile -t shopstream .`; then Compose stack.
4. **Monitoring**: open Grafana -> ShopStream folder -> *ShopStream Overview*; generate traffic with `for i in $(seq 200); do curl -s localhost:8080/api/products >/dev/null; done`.
5. **Logging**: bring up ELK overlay, create the `shopstream-logs-*` data view.
6. **Jenkins**: install Docker, Node 20, trivy, gitleaks on the agent; add credentials `registry-creds`, `kubeconfig`; create a Multibranch Pipeline on the repo; add GitHub webhook `http://<jenkins>:8080/github-webhook/`.
7. **Terraform**: `cd terraform && terraform init && terraform apply -var-file=environments/dev.tfvars`.
8. **Ansible**: `cd ansible && ansible-galaxy collection install community.general && ansible-playbook playbook.yml`.
9. **Kubernetes/Helm**: copy kubeconfig from the server (`/etc/rancher/k3s/k3s.yaml`, replace 127.0.0.1 with the public IP), then `scripts/deploy.sh helm <tag>`.
10. **Strategies**: demo canary (`kubernetes/strategies/canary.yaml`) and blue-green (`blue-green.md`).
11. **AI**: break the app on purpose (stop DB), capture logs, run `analyze.py`.
