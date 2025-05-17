output "db_host" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.main.endpoint
} 