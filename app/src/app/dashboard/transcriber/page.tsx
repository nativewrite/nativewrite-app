"use client";

import { useState, useRef } from 'react';

export default function TranscriberPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      alert('Please select an audio file first');
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData to upload file
      const formData = new FormData();
      formData.append('audio', selectedFile);

      // Upload file first (you'll need to implement this endpoint)
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { audioUrl } = await uploadResponse.json();

      // Start transcription
      const response = await fetch('/api/transcriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl })
      });

      const data = await response.json();
      
      if (data.success) {
        setTranscript(data.text);
      } else {
        alert(data.error || 'Failed to transcribe audio');
      }
    } catch {
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    alert('Copied to clipboard!');
  };

  const downloadTranscript = (format: 'txt' | 'srt') => {
    let content = transcript;
    let filename = 'transcript.txt';
    const mimeType = 'text/plain';

    if (format === 'srt') {
      // Simple SRT format - you might want to enhance this with timestamps
      content = `1\n00:00:00,000 --> 00:00:10,000\n${transcript}`;
      filename = 'transcript.srt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Transcriber</h1>
          <p className="text-slate-600">Convert audio to text with speaker detection and export to Word, PDF, or SRT.</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload audio file
              </label>
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#1E3A8A] transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-slate-600 mb-2">Drop your audio file here, or click to browse</p>
                  <p className="text-sm text-slate-500">Supports MP3, WAV, M4A, and more</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                File: {selectedFile ? selectedFile.name : 'No file selected'}
              </div>
              <button 
                onClick={handleTranscribe}
                disabled={!selectedFile || isLoading}
                className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Transcribing...' : 'Start Transcription'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Transcript
              </label>
              <textarea
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"
                placeholder="Your transcript will appear here..."
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={copyTranscript}
                disabled={!transcript}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copy Transcript
              </button>
              <button 
                onClick={() => downloadTranscript('txt')}
                disabled={!transcript}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download as TXT
              </button>
              <button 
                onClick={() => downloadTranscript('srt')}
                disabled={!transcript}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download as SRT
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}