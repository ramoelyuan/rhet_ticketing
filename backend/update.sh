#!/bin/bash
# Run this on the server from the backend directory: ./update.sh
# Updates deps, then restarts the backend with xvfb (for certificate generation).

set -e
cd "$(dirname "$0")"

# Load nvm or profile so node/npm are in PATH (e.g. when using nvm)
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
[ -s "$HOME/.profile" ] && . "$HOME/.profile"

echo "=== Backend update script ==="

NODE_PATH=$(command -v node 2>/dev/null || true)
if [ -z "$NODE_PATH" ]; then
  for p in /usr/local/bin/node /usr/bin/node; do
    [ -x "$p" ] && NODE_PATH=$p && break
  done
fi
NPM_PATH=$(command -v npm 2>/dev/null || true)
if [ -z "$NPM_PATH" ] && [ -n "$NODE_PATH" ]; then
  NPM_PATH="$(dirname "$NODE_PATH")/npm"
  [ -x "$NPM_PATH" ] || NPM_PATH=""
fi
if [ -z "$NODE_PATH" ]; then
  echo "Error: node not found. Install Node or add it to PATH (e.g. source ~/.nvm/nvm.sh)."
  exit 1
fi

if [ -d "../.git" ]; then
  echo "Pulling latest code..."
  git -C .. pull || true
fi

echo "Installing dependencies..."
if [ -n "$NPM_PATH" ]; then
  "$NPM_PATH" install --production
else
  echo "Warning: npm not found, skipping npm install."
fi

echo "Node at: $NODE_PATH"
echo "Starting backend with xvfb-run..."
exec xvfb-run -a "$NODE_PATH" server.js
