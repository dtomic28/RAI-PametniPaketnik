#!/bin/bash

set -e  # Exit immediately on any error
set -o pipefail

echo "📦 Starting deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Define env file
ENV_FILE=".env.prod"

# Check if .env.prod exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Deployment aborted."
  exit 1
fi

echo "🔄 Stopping old containers (if any)..."
docker compose --env-file $ENV_FILE down

echo "🔨 Building and starting new containers..."
docker compose --env-file $ENV_FILE build --no-cache
docker compose --env-file $ENV_FILE up -d


echo "✅ Deployment complete!"
