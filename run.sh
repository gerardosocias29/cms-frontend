#!/bin/bash

# Script to run the application with environment switching

# Define environment options
LOCAL_API_URL="http://localhost:9876/api"
PROD_API_URL="https://api.dumy.one/api"

# Function to update .env file
update_env_file() {
  local env_type=$1
  local api_url=$2
  
  # Create backup of current .env file
  cp .env .env.backup
  
  # Update the API URL in the .env file
  if grep -q "REACT_APP_API_BASE_URL=" .env; then
    # Replace existing line
    sed -i "s|REACT_APP_API_BASE_URL=.*|REACT_APP_API_BASE_URL=$api_url|g" .env
  else
    # Add new line if it doesn't exist
    echo "REACT_APP_API_BASE_URL=$api_url" >> .env
  fi
  
  echo "Environment switched to $env_type mode. API URL set to $api_url"
}

# Function to display help
show_help() {
  echo "Usage: ./run.sh [options]"
  echo ""
  echo "Options:"
  echo "  --local       Run in local development mode (API: $LOCAL_API_URL)"
  echo "  --prod        Run in production mode (API: $PROD_API_URL)"
  echo "  --build       Build the application"
  echo "  --deploy      Build and deploy the application"
  echo "  --env-only    Only update the environment without starting the app"
  echo "  --help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./run.sh --local          # Run in local development mode"
  echo "  ./run.sh --prod           # Run in production mode"
  echo "  ./run.sh --local --build  # Build for local environment"
}

# Parse command line arguments
ENV_MODE=""
BUILD_MODE=false
DEPLOY_MODE=false
ENV_ONLY=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --local) ENV_MODE="local"; shift ;;
    --prod) ENV_MODE="prod"; shift ;;
    --build) BUILD_MODE=true; shift ;;
    --deploy) DEPLOY_MODE=true; shift ;;
    --env-only) ENV_ONLY=true; shift ;;
    --help) show_help; exit 0 ;;
    *) echo "Unknown parameter: $1"; show_help; exit 1 ;;
  esac
done

# Check if environment mode is specified
if [ -z "$ENV_MODE" ]; then
  echo "Error: Environment mode not specified."
  show_help
  exit 1
fi

# Update environment file
if [ "$ENV_MODE" == "local" ]; then
  update_env_file "local" "$LOCAL_API_URL"
elif [ "$ENV_MODE" == "prod" ]; then
  update_env_file "production" "$PROD_API_URL"
fi

# Exit if only environment update is requested
if [ "$ENV_ONLY" = true ]; then
  echo "Environment updated. Exiting without starting the application."
  exit 0
fi

# Build or deploy if requested
if [ "$DEPLOY_MODE" = true ]; then
  echo "Building and deploying the application..."
  npm run deploy
  exit 0
elif [ "$BUILD_MODE" = true ]; then
  echo "Building the application..."
  npm run build
  exit 0
fi

# Start the application
echo "Starting the application in $ENV_MODE mode..."
npm start
