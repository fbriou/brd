resource "aws_ssm_parameter" "db_host" {
  name  = "/brd/${var.environment}/db-host"
  type  = "String"
  value = var.db_host
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/brd/${var.environment}/db-name"
  type  = "String"
  value = var.db_name
}

resource "aws_ssm_parameter" "db_user" {
  name  = "/brd/${var.environment}/db-user"
  type  = "String"
  value = var.db_username
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/brd/${var.environment}/db-password"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name  = "/brd/${var.environment}/cognito-user-pool-id"
  type  = "String"
  value = var.cognito_user_pool_id
}

resource "aws_ssm_parameter" "cognito_client_id" {
  name  = "/brd/${var.environment}/cognito-client-id"
  type  = "String"
  value = var.cognito_client_id
} 