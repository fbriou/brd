# Infrastructure Setup Guide

This guide explains how to set up and manage the infrastructure for the BRD application using Terraform.

## Overview

The infrastructure is managed using Terraform, with separate configurations for development and production environments. All AWS resources are defined as code, making it easy to version control and replicate environments.

## Directory Structure

```
terraform/
├── environments/          # Environment-specific configurations
│   ├── dev/              # Development environment
│   │   ├── main.tf       # Main configuration
│   │   ├── variables.tf  # Variable definitions
│   │   └── outputs.tf    # Output definitions
│   └── prod/             # Production environment
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── modules/              # Reusable Terraform modules
    ├── cognito/         # Cognito User Pool module
    ├── rds/            # RDS Database module
    └── ssm/            # SSM Parameters module
```

## Prerequisites

1. **AWS CLI Configuration**
   ```bash
   aws configure
   ```

2. **Terraform Installation**
   ```bash
   brew install terraform
   ```

## Environment Setup

### Development Environment

1. **Initialize Terraform**
   ```bash
   cd terraform/environments/dev
   terraform init
   ```

2. **Configure Variables**
   ```bash
   # Copy the example variables file
   cp terraform.tfvars.example terraform.tfvars

   # Edit terraform.tfvars with your values
   ```

3. **Review Changes**
   ```bash
   terraform plan
   ```

4. **Apply Changes**
   ```bash
   terraform apply
   ```

### Production Environment

1. **Initialize Terraform**
   ```bash
   cd terraform/environments/prod
   terraform init
   ```

2. **Configure Variables**
   ```bash
   # Copy the example variables file
   cp terraform.tfvars.example terraform.tfvars

   # Edit terraform.tfvars with your values
   ```

3. **Review Changes**
   ```bash
   terraform plan
   ```

4. **Apply Changes**
   ```bash
   terraform apply
   ```

## Infrastructure Components

### AWS Cognito
- User Pool for authentication
- App Client for API access
- User groups for role-based access

### RDS Database
- PostgreSQL instance
- Automated backups
- Multi-AZ in production
- Security groups for access control

### S3 Bucket
- Photo storage
- CORS configuration
- Lifecycle policies

### SSM Parameters
- Database credentials
- Cognito configuration
- Application settings

## Environment Differences

### Development
- RDS: t3.micro instance
- Storage: 20GB
- Multi-AZ: Disabled
- Backup Retention: 1 day

### Production
- RDS: t3.small instance
- Storage: 50GB
- Multi-AZ: Enabled
- Backup Retention: 7 days

## State Management

Terraform state is stored in S3 with DynamoDB for state locking:
- Bucket: `brd-terraform-state-<environment>`
- DynamoDB table: `brd-terraform-locks-<environment>`

## Security

1. **IAM Roles**
   - Least privilege principle
   - Separate roles for different components
   - Regular permission audits

2. **Network Security**
   - VPC configuration
   - Security groups
   - Private subnets for RDS

3. **Secrets Management**
   - SSM Parameter Store for sensitive data
   - KMS encryption for parameters
   - Regular key rotation

## Maintenance

1. **Regular Tasks**
   - Review and update security groups
   - Monitor RDS performance
   - Check backup status
   - Update Terraform modules

2. **Troubleshooting**
   ```bash
   # Check state lock
   aws dynamodb describe-table --table-name brd-terraform-locks-<environment>

   # Remove state lock if needed
   aws dynamodb delete-item \
     --table-name brd-terraform-locks-<environment> \
     --key '{"LockID": {"S": "terraform/terraform.tfstate-md5"}}'
   ```

## Best Practices

1. **Version Control**
   - Always commit Terraform files
   - Use meaningful commit messages
   - Review changes before applying

2. **State Management**
   - Never modify state manually
   - Use state locking
   - Regular state backups

3. **Security**
   - Regular security audits
   - Rotate credentials
   - Monitor access logs

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review Terraform documentation
3. Open an issue in the repository 