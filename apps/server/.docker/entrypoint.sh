#!/bin/sh
set -e

echo "Starting server..."

# Start the application
echo "Starting application on port $PORT..."
exec node dist/main.js
