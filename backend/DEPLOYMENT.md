# NativeWrite Universal Downloader Engine - Deployment Guide

## Summary of Changes

The backend now includes a **Universal Downloader Engine** that replaces yt-dlp with a modular, extensible system:

### New Architecture

1. **Modular Provider System**
   - `BaseProvider` interface for all download providers
   - `ProviderRegistry` for automatic provider detection
   - Implemented providers:
     - `YouTubeProvider` - Uses Playwright headless browser
     - `DirectMediaProvider` - Direct file downloads (mp4, mp3, m3u8, etc.)
   - Stub providers (not yet implemented):
     - `TikTokProvider`, `InstagramProvider`, `TwitterProvider`, `VimeoProvider`

2. **Job System**
   - Async job processing with background tasks
   - Job storage as JSON files in `storage/jobs/`
   - Job states: `pending`, `running`, `completed`, `failed`
   - Media files stored in `storage/media/`

3. **New API Endpoints**
   - `POST /api/download` - Create download job
   - `GET /api/download/{job_id}` - Get job status
   - `GET /api/download?url=...` - Find job by URL

## VPS Setup Requirements

### 1. Install Playwright Browsers

```bash
cd /opt/nativewrite/backend
source venv/bin/activate
pip install playwright
playwright install chromium
```

### 2. Ensure FFmpeg is Installed

```bash
apt update
apt install -y ffmpeg
```

### 3. Create Storage Directories

```bash
cd /opt/nativewrite/backend
mkdir -p storage/jobs storage/media
chmod 755 storage storage/jobs storage/media
```

### 4. Update Dependencies

```bash
cd /opt/nativewrite/backend
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Restart Service

```bash
systemctl restart nativewrite-backend
systemctl status nativewrite-backend --no-pager
```

## API Usage Examples

### Create a Download Job

```bash
curl -X POST https://api.nativewrite.app/api/download \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "url": "https://youtube.com/watch?v=VIDEO_ID",
    "type": "audio"
  }'
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "provider": "youtube"
}
```

### Check Job Status

```bash
curl -X GET https://api.nativewrite.app/api/download/550e8400-e29b-41d4-a716-446655440000 \
  -H "X-API-Key: YOUR_API_KEY"
```

**Response (completed):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "provider": "youtube",
  "output_type": "audio",
  "download_url": "/media/550e8400-e29b-41d4-a716-446655440000.wav",
  "metadata": {
    "title": "Video Title",
    "duration": 300
  },
  "error_message": null,
  "created_at": "2025-12-02T18:00:00",
  "updated_at": "2025-12-02T18:00:30"
}
```

### Find Job by URL

```bash
curl -X GET "https://api.nativewrite.app/api/download?url=https://youtube.com/watch?v=VIDEO_ID" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Integration with Frontend

The frontend should:

1. Call `POST /api/download` with the YouTube URL
2. Receive `job_id` immediately
3. Poll `GET /api/download/{job_id}` until status is `completed` or `failed`
4. If completed, use `download_url` to access the file
5. For transcription, download the audio file and send to `/api/transcribe-url`

## Notes

- YouTube downloads use Playwright headless browser (more reliable than yt-dlp)
- Jobs are processed asynchronously in background
- Media files are served via `/media/{job_id}.{ext}`
- Old yt-dlp endpoints still exist but new system is recommended

