module "network" {
  source             = "./modules/network"
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  admin_cidr         = var.admin_cidr
}

module "compute" {
  source        = "./modules/compute"
  environment   = var.environment
  instance_type = var.instance_type
  key_name      = var.key_name
  subnet_id     = module.network.public_subnet_id
  sg_id         = module.network.app_sg_id
}

# Generate the Ansible inventory straight from Terraform outputs
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/inventory"
  content  = <<-EOT
    [k8s]
    ${module.compute.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/${var.key_name}.pem
  EOT
}
