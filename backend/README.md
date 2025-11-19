# Nativewrite Backend

FastAPI service that powers automatic audio extraction using `yt-dlp` + `ffmpeg`.

## Features

- `/download/audio`: extract best audio from supported URLs (YouTube, etc.), normalize, expose via `/files`
- `/health`: basic health check
- Static serving of processed audio files
- API key protection and simple rate limiting
- Background cleanup worker removing files older than 2 hours

## Requirements

- Python 3.10+
- ffmpeg installed on the system

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `API_KEY` | Required API key (`X-API-KEY`) |
| `ALLOWED_ORIGIN` | Comma separated list of allowed origins |
| `AUDIO_ROOT` | Directory for storing audio files (default `/tmp/nativewrite/audio`) |
| `RATE_LIMIT_REQUESTS` | Requests per window (default 30) |
| `RATE_LIMIT_WINDOW_SECONDS` | Window length (default 60) |

## Run locally

```bash
cd backend
chmod +x start.sh
./start.sh
```

The service will be available at `http://localhost:8080`.

## Cleaning worker

Files older than two hours are deleted automatically by the background worker. Adjust via `CLEANUP_MAX_AGE_SECONDS`.

