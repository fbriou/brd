# BRD - Photo Management Application

The goal of this project is to create the backend for a Google Drive-like application. It's a photo management application built entirely on AWS serverless architecture, providing a scalable and maintainable solution for handling photo uploads, storage, and management.

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

4. Attach required policies to the group:
   - AmazonCognitoPowerUser
   - AmazonRDSFullAccess
   - AmazonS3FullAccess
   - AWSLambdaFullAccess
   - IAMFullAccess
   - CloudWatchFullAccess
   - AmazonSSMFullAccess

5. Create a custom policy for SSM access:
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

## Tech Stack (all on AWS)

- **API**: Based only on serverless functions (Lambda)
- **Authentication**: Managed with AWS Cognito
- **Authorization**: Middlewares to manage roles and permissions for each function
- **Database**: AWS RDS (PostgreSQL)
- **Storage**: AWS S3 for photo storage
- **Monitoring**: CloudWatch for logs and alarms

## Application Deployment

Any time the project is updated, there is a Database and Lambda Deployment Workflow. The system includes a migration system to manage the database properly, ensuring data consistency across deployments.

[View detailed deployment guide →](DEPLOYMENT.md)

## Infrastructure Deployment

Infrastructure is managed with Terraform, meaning no need to go to AWS console to create assets. Everything is defined as code, making it easy to version control and replicate environments.

[View infrastructure setup guide →](terraform/README.md)

Two environments are supported:
- Development
- Production

## Project Structure

```
.
├── src/
│   ├── functions/          # Lambda functions
│   │   ├── photos/        # Photo management functions
│   │   ├── database/      # Database operations
│   │   └── test/          # Test endpoints
│   └── lib/               # Shared utilities
├── terraform/             # Infrastructure code
│   ├── environments/      # Environment-specific configs
│   │   ├── dev/
│   │   └── prod/
│   └── modules/          # Reusable Terraform modules
├── serverless.yml        # Serverless Framework config
└── package.json          # Project dependencies
```

## API

### Endpoints

- `GET /health` - Health check endpoint
- `POST /photos` - Upload a photo (requires authentication)
- `GET /photos` - List photos (requires authentication)
- `DELETE /photos/{id}` - Delete a photo (requires authentication)

### Authentication

All endpoints (except `/health`) require AWS Cognito authentication. The system uses JWT tokens for secure API access.

### Authorization

Each function has specific permission checks:
- Photo upload: Requires `photos:upload` permission
- Photo listing: Requires `photos:list` permission
- Photo deletion: Requires `photos:delete` permission

## Getting Started

1. **Prerequisites**
   - Node.js 18.x
   - AWS CLI
   - Terraform
   - Serverless Framework
   - AWS Account with appropriate permissions

2. **Quick Start**
   ```bash
   # Clone and install
   git clone <repository-url>
   cd brd
   npm install

   # Configure AWS
   aws configure

   # Deploy infrastructure (dev)
   cd terraform/environments/dev
   terraform init
   terraform apply

   # Deploy application
   serverless deploy --stage dev
   ```

## Support

For issues or questions:
1. Check the [deployment guide](DEPLOYMENT.md)
2. Review CloudWatch logs
3. Open an issue in the repository

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 