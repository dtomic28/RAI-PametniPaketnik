#!/bin/bash

REQUIRED_VARS=("MONGO_USER" "MONGO_PASS" "MONGO_DB" "MONGO_URI_TEMPLATE")

echo "✅ Checking environment variables..."
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  fi
done

echo "✅ All required environment variables are set."
exec "$@"
