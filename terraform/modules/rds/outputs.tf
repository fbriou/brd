output "db_host" {
  description = "The endpoint of the RDS instance (hostname only, no port)"
  value       = split(":", aws_db_instance.main.endpoint)[0]
} 