#!/bin/bash

# Script to switch between local and production environment settings

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

# Check command line argument
if [ "$1" == "local" ]; then
  update_env_file "local" "$LOCAL_API_URL"
elif [ "$1" == "prod" ]; then
  update_env_file "production" "$PROD_API_URL"
else
  echo "Usage: ./switch-env.sh [local|prod]"
  echo ""
  echo "  local - Set environment to local development (API: $LOCAL_API_URL)"
  echo "  prod  - Set environment to production (API: $PROD_API_URL)"
  exit 1
fi

# Inform about restart
echo "Please restart your application for changes to take effect."
