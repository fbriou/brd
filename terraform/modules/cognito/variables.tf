variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
}

variable "callback_urls" {
  description = "List of callback URLs for Cognito"
  type        = list(string)
}

variable "logout_urls" {
  description = "List of logout URLs for Cognito"
  type        = list(string)
} 