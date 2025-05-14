# FH Photos - Serverless Photo Management Application

A serverless application for managing photos using AWS Lambda, S3, RDS, and Cognito.

## Features

- Photo upload, listing, and deletion
- User authentication with AWS Cognito
- Secure file storage in S3
- Database migrations and backups
- Automated deployment pipeline
- Error monitoring and alerts
- Image processing with Sharp
- TypeScript support
- ESLint and TypeScript type checking

## Prerequisites

- Node.js 18.x
- AWS CLI configured with appropriate credentials
- PostgreSQL database (RDS)
- AWS Cognito User Pool

## Project Structure

```
.
├── src/                    # Source code
├── migrations/            # Database migrations
├── serverless.yml        # Serverless Framework configuration
├── buildspec.yml         # AWS CodeBuild configuration
├── deployment-workflow.json # Step Functions workflow
├── migration.config.js   # Database migration configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Environment Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure AWS SSM Parameters:
   ```bash
   # Database configuration
   aws ssm put-parameter --name "/brd/db-host" --value "your-db-host" --type String
   aws ssm put-parameter --name "/brd/db-name" --value "your-db-name" --type String
   aws ssm put-parameter --name "/brd/db-user" --value "your-db-user" --type String
   aws ssm put-parameter --name "/brd/db-password" --value "your-db-password" --type SecureString
   aws ssm put-parameter --name "/brd/db-instance" --value "your-rds-instance-id" --type String

   # Cognito configuration
   aws ssm put-parameter --name "/brd/cognito-user-pool-id" --value "your-user-pool-id" --type String
   aws ssm put-parameter --name "/brd/cognito-client-id" --value "your-client-id" --type String
   ```

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

## Database Management

### Migrations

The application uses `node-pg-migrate` for database migrations. Available commands:

```bash
# Create a new migration
npm run migrate:create -- <migration-name>

# Run pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down
```

### Backups

Database backups are handled automatically through the deployment workflow. Manual backups can be triggered by invoking the backup Lambda function:

```bash
aws lambda invoke --function-name brd-backup-${STAGE} response.json
```

## Deployment

### Manual Deployment

```bash
# Deploy to a specific stage
npm run deploy -- --stage <stage-name>
```

### Automated Deployment

The application uses AWS CodePipeline and Step Functions for automated deployments:

1. Code changes trigger the pipeline
2. CodeBuild runs tests and builds the application
3. Step Functions workflow:
   - Creates a database backup
   - Runs database migrations
   - Deploys Lambda functions
   - Verifies the deployment
   - Rolls back on failure

## API Endpoints

All endpoints require Cognito authentication:

- `POST /photos` - Upload a photo
- `GET /photos` - List photos
- `DELETE /photos/{id}` - Delete a photo

## Dependencies

### Main Dependencies
- `@middy/core` and middleware - Lambda middleware framework
- `aws-sdk` - AWS SDK for Node.js
- `node-pg-migrate` - Database migration tool
- `pg` and `slonik` - PostgreSQL client and query builder
- `sharp` - Image processing library

### Development Dependencies
- TypeScript and type definitions
- ESLint and TypeScript ESLint
- Serverless Framework and plugins
- Jest for testing

## Security

- All endpoints are protected with Cognito authentication
- Database credentials are stored in AWS SSM Parameter Store
- S3 bucket has CORS configuration for secure access
- IAM roles follow the principle of least privilege

## Monitoring

The application includes CloudWatch alarms for:
- Migration errors
- Deployment errors
- Lambda function errors

Alerts are sent to an SNS topic for notification.

## License

MIT 