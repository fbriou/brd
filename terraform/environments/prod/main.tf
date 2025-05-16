module "cognito" {
  source = "../../modules/cognito"
  
  environment    = "prod"
  callback_urls = ["https://your-production-domain.com/callback"]
  logout_urls   = ["https://your-production-domain.com/logout"]
}

module "rds" {
  source = "../../modules/rds"
  
  environment       = "prod"
  db_name          = var.db_name
  db_username      = var.db_username
  db_password      = var.db_password
  instance_type    = "db.t3.small"  # Larger instance for production
  allocated_storage = 50            # More storage for production
}

module "ssm" {
  source = "../../modules/ssm"
  
  environment          = "prod"
  db_host             = module.rds.db_host
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id
} 