import os, io, uuid, time, base64, json, shutil
from datetime import datetime
from threading import Lock

from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename

import yt_dlp
from openai import OpenAI
from pydub import AudioSegment

# Realtime recording
from flask_socketio import SocketIO, emit, join_room, leave_room

load_dotenv()

API_KEY = os.getenv("API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS","*").split(",")]

STORAGE_DIR = os.getenv("STORAGE_DIR", "./storage")
AUDIO_DIR = os.getenv("AUDIO_DIR", os.path.join(STORAGE_DIR, "audio"))
TRANSCRIPT_DIR = os.getenv("TRANSCRIPT_DIR", os.path.join(STORAGE_DIR, "transcripts"))
PORT = int(os.getenv("PORT", "5000"))
MAX_SESSION_SECONDS = int(os.getenv("MAX_SESSION_SECONDS", "7200"))

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)

app = Flask(__name__, static_folder=None)
CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

socketio = SocketIO(app, cors_allowed_origins=ALLOWED_ORIGINS, async_mode="eventlet")

client = OpenAI(api_key=OPENAI_API_KEY)

# ------------------------
# Helpers
# ------------------------
def require_api_key(req):
    hdr = req.headers.get("x-api-key")
    if not API_KEY or hdr != API_KEY:
        return False
    return True

def _audio_path(file_id: str) -> str:
    return os.path.join(AUDIO_DIR, f"{file_id}.mp3")

def _wav_path(file_id: str) -> str:
    return os.path.join(AUDIO_DIR, f"{file_id}.wav")

def _tx_path(file_id: str) -> str:
    return os.path.join(TRANSCRIPT_DIR, f"{file_id}.txt")

def transcribe_file(path: str) -> str:
    """Transcribe with OpenAI Whisper."""
    with open(path, "rb") as f:
        resp = client.audio.transcriptions.create(
            file=f,
            model="whisper-1"
        )
    # OpenAI SDK returns an object with .text
    # For older versions it may be dict-like.
    text = getattr(resp, "text", None) or resp.get("text", "")
    return text

def mp3_to_wav(mp3_path: str, wav_path: str):
    audio = AudioSegment.from_file(mp3_path)
    audio.export(wav_path, format="wav")

# ------------------------
# Health & static serving
# ------------------------
@app.get("/api/health")
def health():
    return {"ok": True, "time": time.time()}

# Serve saved audio and transcripts (temporary public)
@app.get("/audio/<path:filename>")
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename, as_attachment=False)

@app.get("/transcripts/<path:filename>")
def serve_transcript(filename):
    return send_from_directory(TRANSCRIPT_DIR, filename, as_attachment=False)

# ------------------------
# URL → Audio Downloader
# ------------------------
@app.post("/api/fetch-audio")
def fetch_audio():
    if not require_api_key(request):
        return jsonify({"error": "Invalid API key"}), 401

    data = request.get_json()
    video_url = data.get("url")
    if not video_url:
        return jsonify({"error": "Missing video URL"}), 400

    file_id = str(uuid.uuid4())
    audio_path = _audio_path(file_id)

    try:
        # Download with yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': audio_path.replace('.mp3', '.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        # Return public URL
        base_url = request.host_url.rstrip('/')
        audio_url = f"{base_url}/audio/{file_id}.mp3"
        
        return jsonify({
            "success": True,
            "audio_url": audio_url,
            "file_id": file_id
        })

    except Exception as e:
        return jsonify({"error": f"Failed to download audio: {str(e)}"}), 500

# ------------------------
# URL Transcription (one-step)
# ------------------------
@app.post("/api/transcribe-url")
def transcribe_url():
    if not require_api_key(request):
        return jsonify({"error": "Invalid API key"}), 401

    data = request.get_json()
    video_url = data.get("url")
    if not video_url:
        return jsonify({"error": "Missing video URL"}), 400

    file_id = str(uuid.uuid4())
    audio_path = _audio_path(file_id)

    try:
        # Download with yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': audio_path.replace('.mp3', '.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        # Transcribe
        transcript = transcribe_file(audio_path)
        
        # Save transcript
        with open(_tx_path(file_id), 'w', encoding='utf-8') as f:
            f.write(transcript)

        # Clean up audio file
        try:
            os.remove(audio_path)
        except:
            pass

        return jsonify({
            "success": True,
            "transcript": transcript,
            "file_id": file_id
        })

    except Exception as e:
        return jsonify({"error": f"Failed to transcribe: {str(e)}"}), 500

# ------------------------
# File Upload Transcription
# ------------------------
@app.post("/api/transcribe-upload")
def transcribe_upload():
    if not require_api_key(request):
        return jsonify({"error": "Invalid API key"}), 401

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    file_id = str(uuid.uuid4())
    audio_path = _audio_path(file_id)

    try:
        # Save uploaded file
        file.save(audio_path)

        # Convert to MP3 if needed
        if not audio_path.endswith('.mp3'):
            wav_path = _wav_path(file_id)
            mp3_to_wav(audio_path, wav_path)
            os.remove(audio_path)
            os.rename(wav_path, audio_path)

        # Transcribe
        transcript = transcribe_file(audio_path)
        
        # Save transcript
        with open(_tx_path(file_id), 'w', encoding='utf-8') as f:
            f.write(transcript)

        # Clean up audio file
        try:
            os.remove(audio_path)
        except:
            pass

        return jsonify({
            "success": True,
            "transcript": transcript,
            "file_id": file_id
        })

    except Exception as e:
        return jsonify({"error": f"Failed to transcribe: {str(e)}"}), 500

# ------------------------
# Socket.IO Recording Session
# ------------------------
active_sessions = {}
session_lock = Lock()

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Clean up any active sessions
    with session_lock:
        if request.sid in active_sessions:
            del active_sessions[request.sid]

@socketio.on('record:start')
def handle_record_start(data):
    api_key = data.get('apiKey')
    if not API_KEY or api_key != API_KEY:
        emit('error', {'message': 'Invalid API key'})
        return

    session_id = str(uuid.uuid4())
    with session_lock:
        active_sessions[request.sid] = {
            'session_id': session_id,
            'chunks': [],
            'start_time': time.time()
        }
    
    emit('record:ready', {'sessionId': session_id})

@socketio.on('record:chunk')
def handle_record_chunk(data):
    session_id = data.get('sessionId')
    audio_base64 = data.get('audioBase64')
    
    if not session_id or not audio_base64:
        emit('error', {'message': 'Missing session ID or audio data'})
        return

    with session_lock:
        if request.sid not in active_sessions:
            emit('error', {'message': 'No active recording session'})
            return
        
        session = active_sessions[request.sid]
        if session['session_id'] != session_id:
            emit('error', {'message': 'Session ID mismatch'})
            return

        # Decode and store chunk
        try:
            audio_data = base64.b64decode(audio_base64)
            session['chunks'].append(audio_data)
        except Exception as e:
            emit('error', {'message': f'Failed to decode audio: {str(e)}'})
            return

@socketio.on('record:stop')
def handle_record_stop(data):
    session_id = data.get('sessionId')
    sample_rate = data.get('sampleRate', 44100)
    channels = data.get('channels', 1)
    
    with session_lock:
        if request.sid not in active_sessions:
            emit('error', {'message': 'No active recording session'})
            return
        
        session = active_sessions[request.sid]
        if session['session_id'] != session_id:
            emit('error', {'message': 'Session ID mismatch'})
            return

        # Combine all chunks
        audio_data = b''.join(session['chunks'])
        
        # Save audio file
        audio_path = _audio_path(session_id)
        with open(audio_path, 'wb') as f:
            f.write(audio_data)

        # Transcribe
        try:
            transcript = transcribe_file(audio_path)
            
            # Save transcript
            with open(_tx_path(session_id), 'w', encoding='utf-8') as f:
                f.write(transcript)

            # Clean up audio file
            try:
                os.remove(audio_path)
            except:
                pass

            # Return results
            base_url = request.host_url.rstrip('/')
            emit('record:complete', {
                'transcript': transcript,
                'sessionId': session_id,
                'audioUrl': f"{base_url}/audio/{session_id}.mp3",
                'transcriptUrl': f"{base_url}/transcripts/{session_id}.txt"
            })

        except Exception as e:
            emit('error', {'message': f'Transcription failed: {str(e)}'})
            return

        # Clean up session
        del active_sessions[request.sid]

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=PORT, debug=False)

