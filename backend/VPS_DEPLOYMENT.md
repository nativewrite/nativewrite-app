# VPS Deployment Commands for Universal Downloader Engine

## Step-by-Step Deployment

### 1. SSH into VPS
```bash
ssh root@46.224.84.231
# Password: Hamid1213
```

### 2. Navigate to Backend Directory
```bash
cd /opt/nativewrite/backend
```

### 3. Pull Latest Code
```bash
git pull origin main
```

### 4. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 5. Install New Dependencies
```bash
pip install playwright httpx
```

### 6. Install Playwright Browsers (Critical!)
```bash
playwright install chromium
```

### 7. Ensure FFmpeg is Installed
```bash
apt update
apt install -y ffmpeg
```

### 8. Create Storage Directories
```bash
mkdir -p storage/jobs storage/media
chmod 755 storage storage/jobs storage/media
```

### 9. Restart Backend Service
```bash
systemctl restart nativewrite-backend
```

### 10. Check Service Status
```bash
systemctl status nativewrite-backend --no-pager
```

### 11. Check if Service is Listening
```bash
ss -tlnp | grep 8080
```

### 12. Test the New Download Endpoint
```bash
curl -X POST http://127.0.0.1:8080/api/download \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 72cb3db74745564dd0c49a87022be29d98aaafc5fe9f7a9ee3857ebf70af70fe" \
  -d '{"url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "type": "audio"}'
```

## Quick One-Liner (After SSH)
```bash
cd /opt/nativewrite/backend && \
source venv/bin/activate && \
git pull origin main && \
pip install playwright httpx && \
playwright install chromium && \
apt install -y ffmpeg && \
mkdir -p storage/jobs storage/media && \
chmod 755 storage storage/jobs storage/media && \
systemctl restart nativewrite-backend && \
sleep 2 && \
systemctl status nativewrite-backend --no-pager
```





