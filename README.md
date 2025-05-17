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

4. **Recommended:** Instead of attaching many managed policies, create and attach a single custom policy with all required permissions for Serverless and Terraform deployments. Use the following JSON:

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
           "ec2:Describe*",
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

   - Go to IAM > Policies > Create policy > JSON tab, paste the above, and save as e.g. `ServerlessFullDeploymentPolicy`.
   - Attach this policy to your deployment group.
   - Remove redundant managed policies to stay under AWS's 10-policy-per-group limit.

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

## Tech Stack (all on AWS)

- **API**: Based only on serverless functions (Lambda)
- **Authentication**: Managed with AWS Cognito
- **Authorization**: Middlewares to manage roles and permissions for each function
- **Database**: AWS RDS (PostgreSQL)
- **Storage**: AWS S3 for photo storage
- **Monitoring**: CloudWatch for logs and alarms

## Application Deployment

Any time the project is updated, there is a Database and Lambda Deployment Workflow. The system includes a migration system to manage the database properly, ensuring data consistency across deployments.

**Deployment order:**
1. **Deploy the application first:**
   ```bash
   serverless deploy --stage dev
   # or
   serverless deploy --stage prod
   ```
2. **Then run the migration function:**
   ```bash
   serverless invoke --function migrate --stage dev
   # or
   serverless invoke --function migrate --stage prod
   ```

**Troubleshooting:**
- If you see errors like `Could not resolve "<package-name>"` during deployment, make sure to install the missing package:
  ```bash
  npm install <package-name>
  ```
  For example, to fix a missing `lambda-multipart-parser` error:
  ```bash
  npm install lambda-multipart-parser
  ```

[View detailed deployment guide →](DEPLOYMENT.md)

## S3 Bucket Setup (One-Time Manual Step)

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

2. **(Optional) Set CORS configuration for browser uploads:**
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
6. (Optional) Set CORS configuration:
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

Continue with the rest of the deployment as described below.

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