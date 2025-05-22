#!/bin/bash

# Exit on error
set -e

# Default values
ENVIRONMENT="dev"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="AdminPass123!"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --email)
      ADMIN_EMAIL="$2"
      shift 2
      ;;
    --password)
      ADMIN_PASSWORD="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Setting up admin user for environment: $ENVIRONMENT"
echo "Admin email: $ADMIN_EMAIL"

# Get User Pool ID
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 \
  | jq -r ".UserPools[] | select(.Name == \"brd-user-pool-${ENVIRONMENT}\") | .Id")

if [ -z "$USER_POOL_ID" ]; then
  echo "Error: Could not find User Pool for environment $ENVIRONMENT"
  exit 1
fi

echo "Found User Pool ID: $USER_POOL_ID"

# Create admin user
echo "Creating admin user..."
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --temporary-password "$ADMIN_PASSWORD" \
  --user-attributes Name=email,Value="$ADMIN_EMAIL" \
  --message-action SUPPRESS

# Set permanent password
echo "Setting permanent password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD" \
  --permanent

# Create admin group if it doesn't exist
echo "Creating admin group..."
aws cognito-idp create-group \
  --user-pool-id "$USER_POOL_ID" \
  --group-name "admin" \
  --description "Administrator group" || true

# Add user to admin group
echo "Adding user to admin group..."
aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --group-name "admin"

echo "Admin user setup complete!"
echo "You can now use these credentials to sign in to the application."
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD" 