output "public_ip" {
  value = module.compute.public_ip
}
output "app_url" {
  value = "http://${module.compute.public_ip}"
}
output "ssh_command" {
  value = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${module.compute.public_ip}"
}
