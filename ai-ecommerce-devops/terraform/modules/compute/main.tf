variable "environment" { type = string }
variable "instance_type" { type = string }
variable "key_name" { type = string }
variable "subnet_id" { type = string }
variable "sg_id" { type = string }

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "k8s" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.sg_id]

  metadata_options {
    http_tokens = "required" # IMDSv2 only
  }
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }
  tags = {
    Name = "shopstream-${var.environment}-k8s"
  }
}

output "public_ip" {
  value = aws_instance.k8s.public_ip
}
