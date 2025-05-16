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

  tags = {
    Environment = var.environment
    Project     = "brd"
  }
} 