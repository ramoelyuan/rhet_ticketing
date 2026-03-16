# Step-by-step: Set Chromium path and restart backend on the server

Do these steps **on the deployed Linux server** (SSH in or use the server console).

---

## Step 1: Find where Chromium is installed

In the terminal on the server, run:

```bash
which chromium
```

- If it prints a path (e.g. `/usr/bin/chromium`), note it and go to **Step 2**.
- If it prints nothing, run:

```bash
which chromium-browser
```

- If that prints a path (e.g. `/usr/bin/chromium-browser`), note it.
- If both print nothing, install Chromium first:

```bash
sudo apt update
sudo apt install -y chromium
```

Then run `which chromium` again and note the path.

---

## Step 2: Go to the backend folder on the server

```bash
cd ~/rhet_ticketing/backend
```

(Replace `~/rhet_ticketing` with your real project path if different, e.g. `/var/www/rhet_ticketing` or `~/rhet_ticketing`.)

---

## Step 3: Open the `.env` file

```bash
nano .env
```

(Or use `vim .env` if you prefer vim.)

---

## Step 4: Add or edit the Chromium path line

In the `.env` file:

- If there is already a line like `PUPPETEER_EXECUTABLE_PATH=...`, change it to use the path from Step 1.
- If there is no such line, add a new line.

Use the path you got from `which` in Step 1. Examples:

If `which chromium` showed `/usr/bin/chromium`:

```env
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

If `which chromium-browser` showed `/usr/bin/chromium-browser`:

```env
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

- Put this on its own line.
- No spaces around the `=`.
- No quotes.

Save and exit:

- In **nano**: press `Ctrl+O`, Enter, then `Ctrl+X`.
- In **vim**: press `Esc`, type `:wq`, Enter.

---

## Step 5: Restart the backend with xvfb-run

**5a. Stop the backend if it is already running**

- If you start it manually: press `Ctrl+C` in the terminal where it’s running.
- If you use **PM2**:
  ```bash
  pm2 stop backend
  ```
  (Use your app name if it’s different.)
- If you use **systemd**:
  ```bash
  sudo systemctl stop your-backend-service-name
  ```

**5b. Start the backend with xvfb-run**

From the **backend** directory (`cd ~/rhet_ticketing/backend`):

First, find the full path to `node` (run this in a normal terminal, not inside xvfb-run):

```bash
which node
```

You might see `/usr/bin/node`, `/usr/local/bin/node`, or something like `/root/.nvm/versions/node/v20.x.x/bin/node`. Note this path.

Then start the backend using that **full path** so xvfb-run can find Node:

```bash
xvfb-run -a /usr/bin/node server.js
```

Replace `/usr/bin/node` with the path you got from `which node`. Examples:

- If `which node` shows `/usr/local/bin/node`:
  ```bash
  xvfb-run -a /usr/local/bin/node server.js
  ```
- If you use **nvm**, you might see something like `/root/.nvm/versions/node/v20.10.0/bin/node`. Then run:
  ```bash
  xvfb-run -a /root/.nvm/versions/node/v20.10.0/bin/node server.js
  ```
  (Use your actual nvm node path.)

Or, if you use npm and know the path to `npm` (from `which npm`):

```bash
xvfb-run -a /usr/bin/npm start
```

(Replace `/usr/bin/npm` with the path from `which npm`.)

Leave this terminal open; the backend is now running with a virtual display.

**If you get "xvfb-run: command not found"**, install Xvfb first:

```bash
sudo apt update
sudo apt install -y xvfb
```

**If you get "node: not found" or "npm: not found"** when using xvfb-run, always use the **full path** to `node` (or `npm`) as shown above.

To run it in the background instead:

```bash
nohup xvfb-run -a /usr/bin/node server.js > backend.log 2>&1 &
```

(Use your real node path from `which node`.)

Or with **PM2** (use full path to node if needed):

```bash
xvfb-run -a pm2 start server.js --name backend
pm2 save
```

---

## Step 6: Test certificate generation

1. Open the app in the browser using the **server’s IP** (e.g. `http://192.168.1.10:3000` or your real URL).
2. Log in as **admin**.
3. Go to **Reports & Analytics**.
4. Choose **month** and **year**.
5. Click **Generate Certificate**.
6. In the modal, choose **Technician of the Month (most resolved)** or **(top rating)**.
7. The PDF should download. If you still see an error, the modal message will show what went wrong.

---

## Quick reference

| Step | Command / action |
|------|-------------------|
| 1 | `which chromium` or `which chromium-browser` → note the path |
| 2 | `cd ~/rhet_ticketing/backend` (or your backend path) |
| 3 | `nano .env` |
| 4 | Add or set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` (or the path from step 1) |
| 5 | Stop old backend, then run `xvfb-run -a node server.js` (or `xvfb-run -a npm start`) |
| 6 | Open app in browser, Reports → Generate Certificate and test |
