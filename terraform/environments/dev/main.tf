module "cognito" {
  source = "../../modules/cognito"
  
  environment    = "dev"
  callback_urls = ["http://localhost:3000/callback"]
  logout_urls   = ["http://localhost:3000/logout"]
}

module "rds" {
  source = "../../modules/rds"
  
  environment       = "dev"
  db_name          = var.db_name
  db_username      = var.db_username
  db_password      = var.db_password
  instance_type    = "db.t3.micro"
  allocated_storage = 20
}

module "ssm" {
  source = "../../modules/ssm"
  
  environment          = "dev"
  db_host             = module.rds.db_host
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id
} 