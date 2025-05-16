# Detailed Deployment Guide

This guide provides comprehensive instructions for deploying the BRD application, including database migrations and Lambda function deployments.

## Overview

The deployment process consists of two main parts:
1. Database migrations to ensure schema consistency
2. Lambda function deployments for application updates

## Prerequisites

1. **AWS CLI Configuration**
   ```bash
   aws configure
   ```

2. **Serverless Framework**
   ```bash
   npm install -g serverless
   ```

3. **Node.js Dependencies**
   ```bash
   npm install
   ```

## Deployment Workflow

### 1. Database Migration

The application uses a migration system to manage database schema changes:

```bash
# Run migrations
serverless invoke --function migrate --stage <stage>

# Expected output:
{
  "statusCode": 200,
  "body": "Migrations completed successfully"
}
```

### 2. Lambda Deployment

Deploy the serverless application:

```bash
# Deploy to development
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

## Environment Configuration

### Development
```yaml
# serverless.yml environment variables
environment:
  DB_HOST: ${ssm:/brd/db-host}
  DB_NAME: ${ssm:/brd/db-name}
  DB_USER: ${ssm:/brd/db-user}
  DB_PASSWORD: ${ssm:/brd/db-password}
  S3_BUCKET: photos-dev
  COGNITO_USER_POOL_ID: ${ssm:/brd/cognito-user-pool-id}
  COGNITO_CLIENT_ID: ${ssm:/brd/cognito-client-id}
```

### Production
```yaml
# serverless.yml environment variables
environment:
  DB_HOST: ${ssm:/brd/db-host}
  DB_NAME: ${ssm:/brd/db-name}
  DB_USER: ${ssm:/brd/db-user}
  DB_PASSWORD: ${ssm:/brd/db-password}
  S3_BUCKET: photos-prod
  COGNITO_USER_POOL_ID: ${ssm:/brd/cognito-user-pool-id}
  COGNITO_CLIENT_ID: ${ssm:/brd/cognito-client-id}
```

## Lambda Functions

### Photo Management
- `uploadPhoto`: Handles photo uploads to S3
- `listPhotos`: Retrieves photo listings
- `deletePhoto`: Removes photos from storage

### Database Operations
- `migrate`: Manages database schema changes
- `backup`: Creates database backups

### Utility Functions
- `health`: Health check endpoint

## Monitoring

### CloudWatch Alarms
- Migration errors: `${service}-migration-error-${stage}`
- Deployment errors: `${service}-deployment-error-${stage}`
- Lambda function errors

### SNS Notifications
- Alerts sent to: `${service}-alerts-${stage}`
- Configure email subscriptions for notifications

## Troubleshooting

### Common Issues

1. **Migration Failures**
   ```bash
   # Check migration logs
   serverless logs --function migrate --stage <stage>
   
   # Verify database connection
   aws ssm get-parameter --name "/brd/db-host" --with-decryption
   ```

2. **Deployment Failures**
   ```bash
   # Check deployment logs
   serverless logs --function deploy --stage <stage>
   
   # Verify IAM permissions
   aws iam get-user
   ```

3. **Function Errors**
   ```bash
   # View function logs
   serverless logs --function <function-name> --stage <stage>
   
   # Check function configuration
   serverless info --stage <stage>
   ```

### Useful Commands

```bash
# List all functions
serverless info --stage <stage>

# Invoke function locally
serverless invoke local --function <function-name> --stage <stage>

# View function logs
serverless logs --function <function-name> --stage <stage>

# Remove deployment
serverless remove --stage <stage>
```

## Security

1. **Authentication**
   - All endpoints (except /health) require Cognito authentication
   - JWT tokens for API access
   - Token validation in API Gateway

2. **Authorization**
   - Role-based access control
   - Permission checks in Lambda functions
   - S3 bucket policies

3. **Secrets Management**
   - SSM Parameter Store for sensitive data
   - KMS encryption for parameters
   - Regular key rotation

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   ```bash
   # Create backup
   serverless invoke --function backup --stage <stage>
   
   # Run migrations
   serverless invoke --function migrate --stage <stage>
   ```

2. **Monitoring**
   ```bash
   # Check function metrics
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Errors \
     --dimensions Name=FunctionName,Value=<function-name> \
     --start-time $(date -v-1H +%Y-%m-%dT%H:%M:%S) \
     --end-time $(date +%Y-%m-%dT%H:%M:%S) \
     --period 300 \
     --statistics Sum
   ```

3. **Logs Management**
   ```bash
   # View recent logs
   serverless logs --function <function-name> --stage <stage> --tail
   
   # Export logs
   aws logs export-task \
     --task-name "export-$(date +%Y%m%d)" \
     --log-group-name "/aws/lambda/<function-name>" \
     --from $(date -v-7d +%s000) \
     --to $(date +%s000) \
     --destination "s3://<bucket-name>/logs"
   ```

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review CloudWatch logs
3. Open an issue in the repository 