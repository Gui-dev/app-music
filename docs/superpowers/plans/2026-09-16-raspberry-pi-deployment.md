# Raspberry Pi 4 Server Deployment Plan

> **For agentic workers:** This plan is a reference for future implementation. NOT being executed now.

**Goal:** Deploy the Fastify music server on a Raspberry Pi 4 with an external HDD containing MP3 files, accessible from the mobile app over LAN.

**Architecture:** Pi 4 runs the Node.js server as a systemd service. External HDD is auto-mounted. Mobile app points to Pi's LAN IP.

**Tech Stack:** Raspberry Pi OS (Bookworm), Node.js 22 LTS, systemd, NTFS/exFAT HDD support

---

## Prerequisites

- Raspberry Pi 4 (4GB+ RAM recommended)
- SD card (32GB+ recommended for OS)
- External HDD/SSD with music files (USB 3.0 recommended)
- Power supply (USB-C, official Raspberry Pi charger)
- Ethernet cable or Wi-Fi configured
- SSH access enabled

---

## Phase 1: Pi Initial Setup

### Task 1: Flash Raspberry Pi OS

1. Download Raspberry Pi Imager on your PC
2. Flash **Raspberry Pi OS Lite (Bookworm)** to SD card
3. Before ejecting SD card, enable SSH:
   - Create empty file `bootfs/ssh` on the SD card
4. Boot the Pi, connect via SSH:
   ```bash
   ssh pi@<pi-ip>
   ```
5. Update system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
6. Set timezone:
   ```bash
   sudo dpkg-reconfigure tzdata
   ```

---

## Phase 2: External HDD Setup

### Task 2: Mount External HDD

1. Plug HDD into Pi (USB 3.0 port — blue)
2. Find the device:
   ```bash
   lsblk
   ```
3. Format if needed (NTFS recommended for cross-platform):
   ```bash
   sudo apt install ntfs-3g
   ```
4. Create mount point:
   ```bash
   sudo mkdir -p /mnt/music
   ```
5. Get disk UUID:
   ```bash
   sudo blkid /dev/sda1
   ```
6. Add to `/etc/fstab` for auto-mount on boot:
   ```
   UUID=<your-uuid>  /mnt/music  ntfs-3g  defaults,auto,uid=pi,gid=pi,dmask=022,fmask=133  0  0
   ```
7. Mount now:
   ```bash
   sudo mount -a
   ```
8. Verify:
   ```bash
   ls /mnt/music
   ```

---

## Phase 3: Node.js Installation

### Task 3: Install Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:
```bash
node -v   # v22.x.x
npm -v    # 10.x.x
```

Install pnpm:
```bash
sudo npm install -g pnpm
```

---

## Phase 4: Deploy Application

### Task 4: Copy Project to Pi

Option A — Git clone (if repo is on GitHub/GitLab):
```bash
cd /home/pi
git clone <your-repo-url> app-music
cd app-music
```

Option B — SCP from PC:
```bash
scp -r /path/to/app-music pi@<pi-ip>:/home/pi/app-music
```

### Task 5: Install Dependencies and Build

```bash
cd /home/pi/app-music
pnpm install --prod
cd apps/server
pnpm build
```

### Task 6: Configure Environment

Create `/home/pi/app-music/apps/server/.env`:
```
PORT=3000
MUSIC_PATH=/mnt/music
LASTFM_API_KEY=your_key_here
```

### Task 7: Test Server Manually

```bash
cd /home/pi/app-music/apps/server
pnpm start
```

From another device on LAN, verify:
```bash
curl http://<pi-ip>:3000/
curl http://<pi-ip>:3000/music
```

---

## Phase 5: Systemd Service

### Task 8: Create systemd Service

Create `/etc/systemd/system/music-server.service`:

```ini
[Unit]
Description=Music Streaming API Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/app-music/apps/server
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/home/pi/app-music/apps/server/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable music-server
sudo systemctl start music-server
```

Check status:
```bash
sudo systemctl status music-server
sudo journalctl -u music-server -f
```

---

## Phase 6: Music Scanning

### Task 9: Scan Music Library

After server is running, scan your music directory:
```bash
curl -X POST http://<pi-ip>:3000/scan -H "Content-Type: application/json" -d '{}'
```

Or with a specific path:
```bash
curl -X POST http://<pi-ip>:3000/scan -H "Content-Type: application/json" -d '{"path": "/mnt/music"}'
```

To re-scan after adding new music, run the same command again.

---

## Phase 7: Mobile App Configuration

### Task 10: Update Mobile App to Point to Pi

1. Find Pi's LAN IP:
   ```bash
   hostname -I
   ```

2. Update `apps/mobile/.env`:
   ```
   EXPO_PUBLIC_API_BASE=http://<pi-ip>:3000
   ```

3. Rebuild/reload the Expo app:
   ```bash
   cd apps/mobile
   npx expo start --lan
   ```

---

## Phase 8: Network & Security

### Task 11: Firewall Configuration

```bash
sudo apt install ufw
sudo ufw allow ssh
sudo ufw allow 3000/tcp
sudo ufw enable
```

### Task 12: Static IP (Recommended)

Set a static IP for the Pi so the mobile app URL doesn't change.

Edit `/etc/dhcpcd.conf`:
```
interface eth0
static ip_address=192.168.0.100/24
static routers=192.168.0.1
static domain_name_servers=8.8.8.8 1.1.1.1
```

Or via router DHCP reservation (preferred).

---

## Phase 9: Optional Enhancements

### Task 13: Docker Deployment (Alternative)

Create `Dockerfile` in `apps/server/`:
```dockerfile
FROM node:22-slim
RUN apt-get update && apt-get install -y ntfs-3g
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  server:
    build: ./apps/server
    ports:
      - "3000:3000"
    volumes:
      - /mnt/music:/mnt/music:ro
      - ./apps/server/data:/app/data
    env_file:
      - ./apps/server/.env
    restart: unless-stopped
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Server URL | `http://<pi-ip>:3000` |
| Music path | `/mnt/music` (mounted HDD) |
| Database | `/home/pi/app-music/apps/server/data/music.db` |
| Service | `music-server` (systemd) |
| Logs | `sudo journalctl -u music-server -f` |
| Restart | `sudo systemctl restart music-server` |
| Scan music | `curl -X POST http://<pi-ip>:3000/scan` |

---

## File Changes Required

None to the codebase. This is purely operational/deployment. The server already:
- Reads `MUSIC_PATH` from env
- Listens on `0.0.0.0` (all interfaces)
- Has `pnpm build` and `pnpm start` scripts
- Creates `data/` directory automatically
- Supports byte-range streaming
