resource "aws_cognito_user_pool" "main" {
  name = "brd-user-pool-${var.environment}"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required           = true
    mutable            = true
  }

  auto_verified_attributes = ["email"]

  tags = {
    Environment = var.environment
    Project     = "brd"
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name                = "brd-app-client-${var.environment}"
  user_pool_id        = aws_cognito_user_pool.main.id
  generate_secret     = false
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
} 