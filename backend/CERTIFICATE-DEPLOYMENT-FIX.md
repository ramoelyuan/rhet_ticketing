# Fix Certificate Generation When Deployed

When you click "Generate Certificate" on the admin Reports page in production, it often fails (e.g. 500 error) because the server does not have a browser for PDF generation or the certificate image is missing. Follow these steps on the **deployed server** (e.g. Proxmox, Ubuntu, Debian).

---

## Step 1: Install Chromium on the server

The backend uses Puppeteer to generate PDFs. On Linux servers there is no Chrome by default, so you must install Chromium.

**On Debian/Ubuntu (including Proxmox LXC/VM):**
```bash
sudo apt update
sudo apt install -y chromium chromium-sandbox
```

**If the package is named differently (try one of these):**
```bash
sudo apt install -y chromium-browser
# or
sudo apt install -y chromium
```

**Find where Chromium was installed:**
```bash
which chromium
# or
which chromium-browser
```

Common paths:
- `/usr/bin/chromium`
- `/usr/bin/chromium-browser`

Use the path you get in Step 2.

---

## Step 2: Set the Chromium path in the backend environment

On the server where the **backend** runs, set the environment variable so the app uses the system Chromium instead of downloading Chrome.

**If you use a `.env` file** (in `backend/` on the server), add or edit:

```env
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

Use the path from Step 1 (e.g. `/usr/bin/chromium-browser` if that is what `which` showed).

**If you use systemd**, edit the service file (e.g. `sudo nano /etc/systemd/system/your-backend.service`) and add under `[Service]`:

```ini
Environment="PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium"
```

**If you use Docker**, pass the variable when running the container, and install Chromium in the image:

```dockerfile
RUN apt-get update && apt-get install -y chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

**If you use a host like Railway/Render:** set `PUPPETEER_EXECUTABLE_PATH` in the dashboard to the path where their buildpack or image installs Chromium (check their docs).

Then **restart the backend** so the new env is loaded.

---

## Step 3: Make the certificate image available to the backend

The PDF uses a template image. The code looks for `supportcertificate.png` in several places; on deployment the backend often runs from a different directory and may not see `frontend/public/supportcertificate.png`.

**Option A – Copy the image next to the backend (recommended):**

1. On your machine, the image is at: `frontend/public/supportcertificate.png`.
2. On the server, copy it to a path the backend can read, e.g.:
   - `backend/assets/supportcertificate.png`, or
   - `backend/public/supportcertificate.png`.
3. In the backend `.env` on the server, set (use an **absolute** path to avoid confusion):

```env
CERTIFICATE_IMAGE_PATH=/var/www/your-app/backend/assets/supportcertificate.png
```

Replace with the **real absolute path** where you put the file on the server.

**Option B – Keep using the default paths:**  
If your deploy copies the whole repo (including `frontend/public/supportcertificate.png`) and the backend runs with `process.cwd()` such that `frontend/public/supportcertificate.png` or `../frontend/public/supportcertificate.png` exists, you can skip `CERTIFICATE_IMAGE_PATH`. If you get an error like "Certificate template image not found", use Option A and set `CERTIFICATE_IMAGE_PATH`.

---

## Step 4: Restart the backend and test

1. Restart the backend process (e.g. `sudo systemctl restart your-backend` or restart your Node/PM2 process).
2. Log in as admin → Reports & Analytics → choose month/year → Generate Certificate → pick one of the two certificate types.
3. If it still fails, check the backend logs; the server often returns a message like:
   - "could not start browser" → Chromium not installed or wrong `PUPPETEER_EXECUTABLE_PATH`.
   - "Certificate template image not found" → set `CERTIFICATE_IMAGE_PATH` correctly (Step 3).

---

## Step 5: If Chromium still fails (optional)

Some environments need extra flags or a different browser. The code already uses:

- `--no-sandbox`
- `--disable-setuid-sandbox`
- `--disable-dev-shm-usage`
- `--disable-gpu`
- `--single-process`

If you see a launch error even with the correct `PUPPETEER_EXECUTABLE_PATH`, try:

1. **Install missing libraries:**
   ```bash
   sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
   ```

2. **Run Chromium once manually** to see if it starts:
   ```bash
   /usr/bin/chromium --headless --no-sandbox --dump-dom https://example.com
   ```
   If this fails, fix Chromium/dependencies first; then the app will work.

---

## Summary checklist

| Step | What to do |
|------|------------|
| 1 | Install Chromium on the server and note its path (e.g. `/usr/bin/chromium`). |
| 2 | Set `PUPPETEER_EXECUTABLE_PATH` to that path in the backend env and restart. |
| 3 | Ensure `supportcertificate.png` is available; if not, copy it and set `CERTIFICATE_IMAGE_PATH` to its absolute path. |
| 4 | Restart backend and test "Generate Certificate" from Reports. |
| 5 | If it still fails, install extra libraries and test Chromium from the command line. |

The backend already returns JSON errors (e.g. `{ "error": "..." }`) on failure, so the admin UI will show the error message in the certificate modal.
