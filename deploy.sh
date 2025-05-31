#!/bin/bash

set -e
set -o pipefail

echo "📦 Starting deployment..."

cd "$(dirname "$0")"

ENV_FILE=".env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Deployment aborted."
  exit 1
fi

echo "🔄 Stopping old containers..."
docker compose --env-file $ENV_FILE down

echo "🚀 Starting containers without rebuilding..."
docker compose --env-file $ENV_FILE up -d

docker image prune -a

echo "✅ Deployment complete!"
