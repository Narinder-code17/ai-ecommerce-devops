variable "region" {
  type    = string
  default = "ap-south-1"
}
variable "environment" {
  type    = string
  default = "dev"
}
variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}
variable "public_subnet_cidr" {
  type    = string
  default = "10.20.1.0/24"
}
variable "instance_type" {
  type    = string
  default = "t3.medium"
}
variable "key_name" {
  type        = string
  description = "Existing EC2 key pair name"
}
variable "admin_cidr" {
  type        = string
  description = "CIDR allowed to SSH and reach the k8s API (your IP, e.g. 203.0.113.4/32)"
  validation {
    condition     = var.admin_cidr != "0.0.0.0/0"
    error_message = "Do not open SSH to the world; set admin_cidr to your own IP."
  }
}
