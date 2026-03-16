#!/bin/bash
# Run this script on the DEPLOYED Linux server (e.g. Proxmox, Ubuntu) to fix certificate generation (500 error).
# Usage: bash scripts/setup-certificate-server.sh

set -e
echo "=== Certificate generation setup for deployed server ==="

echo ""
echo "1. Installing Chromium, Xvfb, and Chrome/Chromium dependencies (fixes libnss3.so etc.)..."
sudo apt-get update -qq
sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libxshmfence1 xvfb 2>/dev/null || true
sudo apt-get install -y chromium chromium-sandbox xvfb 2>/dev/null || sudo apt-get install -y chromium-browser xvfb 2>/dev/null || true

CHROMIUM_PATH=""
for p in /usr/bin/chromium /usr/bin/chromium-browser; do
  if [ -x "$p" ]; then
    CHROMIUM_PATH="$p"
    break
  fi
done

if [ -z "$CHROMIUM_PATH" ]; then
  echo "   Could not find Chromium. Install manually: sudo apt install -y chromium"
  exit 1
fi
echo "   Found Chromium at: $CHROMIUM_PATH"

echo ""
echo "2. Add this to your backend .env on the server:"
echo "   PUPPETEER_EXECUTABLE_PATH=$CHROMIUM_PATH"
echo ""
echo "3. Start the backend with a virtual display (choose one):"
echo "   From backend directory:"
echo "   xvfb-run -a node server.js"
echo "   or: xvfb-run -a npm start"
echo ""
echo "   If using systemd, add to [Service]:"
echo "   Environment=\"DISPLAY=:99\""
echo "   ExecStartPre=/usr/bin/Xvfb :99 -screen 0 1920x1080x24 -ac &"
echo "   (Then restart the service.)"
echo ""
echo "4. Ensure backend/assets/supportcertificate.png exists (copy from frontend/public/supportcertificate.png if needed)."
echo ""
echo "5. Restart the backend and try Generate Certificate again from the Reports page."
