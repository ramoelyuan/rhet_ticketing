#!/bin/bash
# Run this on the server from the backend directory: ./update.sh
# Updates deps, then restarts the backend with xvfb (for certificate generation).

set -e
cd "$(dirname "$0")"

echo "=== Backend update script ==="

if [ -d "../.git" ]; then
  echo "Pulling latest code..."
  git -C .. pull || true
fi

echo "Installing dependencies..."
npm install --production

NODE_PATH=$(command -v node 2>/dev/null || true)
if [ -z "$NODE_PATH" ]; then
  echo "Error: node not found in PATH. Add Node to PATH or set NODE_PATH in this script."
  exit 1
fi

echo "Node at: $NODE_PATH"
echo "Starting backend with xvfb-run..."
exec xvfb-run -a "$NODE_PATH" server.js
