output "user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "client_id" {
  description = "The ID of the Cognito App Client"
  value       = aws_cognito_user_pool_client.main.id
} 