# Deployment guide (AWS)
Prereqs: AWS account + CLI configured, EC2 key pair, Terraform >= 1.5, Ansible, kubectl, Helm.
```bash
cd terraform
# edit environments/dev.tfvars: key_name, admin_cidr (your IP /32)
terraform init && terraform plan  -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars     # also writes ../ansible/inventory
cd ../ansible && ansible-playbook playbook.yml
# fetch kubeconfig
scp -i ~/.ssh/KEY.pem ubuntu@IP:/etc/rancher/k3s/k3s.yaml ~/.kube/shopstream.yaml
sed -i 's/127.0.0.1/IP/' ~/.kube/shopstream.yaml && export KUBECONFIG=~/.kube/shopstream.yaml
IMAGE_REPO=youruser/shopstream scripts/deploy.sh helm v1
curl http://IP/health
```
**Cost:** a t3.medium runs roughly a few USD per day. Always `terraform destroy -var-file=environments/dev.tfvars` when done.
**Database:** the demo works without one (in-memory data). To use Postgres on k8s, install a chart (e.g. Bitnami postgresql) and pass `--set secret.DATABASE_URL=...`.
