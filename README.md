# BRD - Photo Management Application

The goal of this project is to create the backend for a Google Drive-like application. It's a photo management application built entirely on AWS serverless architecture, providing a scalable and maintainable solution for handling photo uploads, storage, and management.

## Tech Stack

### Database
- **AWS RDS (PostgreSQL)**: Primary database for storing application data
- **Migration System**: Automated database migration management to ensure data consistency across deployments
- **Data Integrity**: Version-controlled schema changes with rollback capabilities

### Serverless Architecture
- **AWS Lambda**: Core business logic implemented as serverless functions
- **API Gateway**: RESTful API endpoints for photo management
- **S3 Storage**: Secure and scalable photo storage solution
- **CloudWatch**: Comprehensive logging and monitoring

### Authentication & Authorization
- **AWS Cognito**: User authentication and management
- **Role-Based Access Control**: Fine-grained permissions system
- **JWT Tokens**: Secure API access management
- **Custom Middlewares**: Request validation and authorization checks

## Infrastructure Deployment

The infrastructure is managed using Terraform, following Infrastructure as Code (IaC) best practices. This approach ensures:
- Version-controlled infrastructure
- Consistent environments
- Easy replication of infrastructure
- Automated resource management

Before deploying the application, you need to:
1. Set up your AWS account and configure credentials
2. Create the S3 bucket for photo storage
3. Deploy the infrastructure using Terraform

[View detailed infrastructure setup guide →](terraform/README.md)

Two environments are supported:
- Development
- Production

## Continuous Integration & Deployment

### Deployment Workflow
1. **Deploy the application:**
   ```bash
   serverless deploy --stage dev
   # or
   serverless deploy --stage prod
   ```

2. **Run database migrations:**
   ```bash
   serverless invoke --function migrate --stage dev
   # or
   serverless invoke --function migrate --stage prod
   ```

[View detailed deployment guide →](DEPLOYMENT.md)

## API Documentation

The API provides endpoints for:
- Health checks
- Photo upload
- Photo listing
- Photo deletion
- User management

All endpoints (except `/health`) require AWS Cognito authentication and appropriate permissions.

[View full API documentation →](API.md)

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

## Support

For issues or questions:
1. Check the [deployment guide](DEPLOYMENT.md)
2. Review CloudWatch logs
3. Open an issue in the repository

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 