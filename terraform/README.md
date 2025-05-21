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
   - Please follow the AWS setup instructions in this guide to configure your AWS CLI and credentials.

2. **Terraform Installation**
   ```bash
   brew install terraform
   ```

## AWS Setup

### 1. Create an AWS Account
1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Set up billing information
5. Enable MFA for the root account

### 2. Set Up IAM Groups and Users
1. Sign in to AWS Console
2. Navigate to IAM service

3. Create a deployment group:
   ```bash
   # Click "Groups" → "Create group"
   # Group name: brd-deployers
   ```

4. **Recommended:** Create and attach a custom policy with all required permissions for Serverless and Terraform deployments:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "apigateway:*",
           "cloudformation:*",
           "cognito-idp:*",
           "dynamodb:*",
           "ec2:*",
           "iam:*",
           "lambda:*",
           "logs:*",
           "rds:*",
           "s3:*",
           "sns:*",
           "ssm:*",
           "cloudwatch:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

   - Go to IAM > Policies > Create policy > JSON tab, paste the above, and save as `ServerlessFullDeploymentPolicy`
   - Attach this policy to your deployment group
   - Remove redundant managed policies to stay under AWS's 10-policy-per-group limit

5. Create a custom policy for SSM access (optional if using the above):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ssm:GetParameter",
           "ssm:GetParameters",
           "ssm:PutParameter",
           "ssm:DeleteParameter"
         ],
         "Resource": "arn:aws:ssm:*:*:parameter/brd/*"
       }
     ]
   }
   ```

6. Create a deployment user:
   ```bash
   # Click "Users" → "Add user"
   # Username: brd-deployer
   # Select "Access key - Programmatic access"
   # Add user to group: brd-deployers
   ```

7. Create an access key for the deployment user:
   - In the AWS Console, go to IAM > Users > brd-deployer
   - Click on "Create access key"
   - Choose "Application running outside AWS" if prompted
   - Download or copy the Access Key ID and Secret Access Key (you will only see the secret once!)
   - Store these credentials securely; you will use them to configure the AWS CLI

### 3. Configure AWS CLI
1. Install AWS CLI:
   ```bash
   brew install awscli
   ```

2. Configure with your credentials:
   ```bash
   aws configure
   # AWS Access Key ID: [Enter your Access Key ID]
   # AWS Secret Access Key: [Enter your Secret Access Key]
   # Default region name: us-east-1
   # Default output format: json
   ```

3. Verify configuration:
   ```bash
   aws sts get-caller-identity
   # Expected output:
   {
     "UserId": "XXXXXXXXXXXXXXXXXXXXX",
     "Account": "123456789012",
     "Arn": "arn:aws:iam::123456789012:user/brd-deployer"
   }
   ```

### 4. Set Up Multiple Profiles (Optional)
```bash
# Development profile
aws configure --profile dev

# Production profile
aws configure --profile prod

# Use a specific profile
export AWS_PROFILE=dev  # or prod
```

## S3 Bucket Setup

Before deploying the application, you must manually create the S3 bucket that will be used for photo storage. This avoids deployment errors due to bucket name conflicts and ensures the bucket is not managed by CloudFormation.

### Option 1: Using the AWS CLI

1. **Create the S3 bucket (replace the bucket name and region as needed):**
   ```bash
   aws s3api create-bucket --bucket photos-dev --region us-east-1
   ```
   > For regions other than us-east-1, add:
   > ```bash
   > --create-bucket-configuration LocationConstraint=us-east-1
   > ```

2. **Set CORS configuration for browser uploads:**
   Create a file called `cors.json`:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
   Then run:
   ```bash
   aws s3api put-bucket-cors --bucket photos-dev --cors-configuration file://cors.json
   ```

### Option 2: Using the AWS Console

1. **Go to the [AWS S3 Console](https://s3.console.aws.amazon.com/s3/home)**
2. Click **Create bucket**
3. Enter a unique bucket name (e.g., `photos-dev`) and select your region
4. Leave the rest of the settings as default (or adjust as needed)
5. Click **Create bucket**
6. Set CORS configuration:
   - Click on your bucket name
   - Go to the **Permissions** tab
   - Scroll down to **Cross-origin resource sharing (CORS)**
   - Click **Edit** and paste the following:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedOrigins": ["*"],
         "MaxAgeSeconds": 3000
       }
     ]
     ```
   - Click **Save changes**

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

5. **Deploy the Application**
   - Once infrastructure is ready, follow the [main README](../../README.md#application-deployment) to deploy the application using the Serverless Framework.

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

5. **Deploy the Application**
   - Once infrastructure is ready, follow the [main README](../../README.md#application-deployment) to deploy the application using the Serverless Framework.

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