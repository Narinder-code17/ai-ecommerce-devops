terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
  # For team use, uncomment and create the bucket/table first:
  # backend "s3" {
  #   bucket         = "YOUR-tf-state-bucket"
  #   key            = "shopstream/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "tf-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "shopstream"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
