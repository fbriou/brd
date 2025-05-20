resource "aws_security_group" "rds" {
  name        = "brd-rds-${var.environment}"
  description = "Security group for RDS instance"
  vpc_id      = data.aws_vpc.default.id

  dynamic "ingress" {
    for_each = var.environment == "dev" ? [1] : []
    content {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = var.environment
    Project     = "brd"
  }
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_db_instance" "main" {
  identifier           = "brd-db-${var.environment}"
  engine              = "postgres"
  engine_version      = "14"
  instance_class      = var.instance_type
  allocated_storage   = var.allocated_storage
  db_name             = var.db_name
  username            = var.db_username
  password            = var.db_password
  skip_final_snapshot = var.environment == "dev" ? true : false
  backup_retention_period = var.environment == "prod" ? 7 : 1
  multi_az            = var.environment == "prod" ? true : false
  publicly_accessible = var.environment == "dev" ? true : false
  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = {
    Environment = var.environment
    Project     = "brd"
  }
} 