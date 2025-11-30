"use client";

import { useState } from 'react';

type Props = {
  onTranscript: (text: string) => void;
};

export default function VideoURLUploader({ onTranscript }: Props) {
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'transcribing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const startTranscription = async () => {
    if (!videoUrl.trim()) return;
    setError('');
    setStatus('downloading');
    try {
      // Kick off server-side flow
      const res = await fetch('/api/transcribe/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      setStatus('transcribing');

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to transcribe');
      }

      onTranscript(data.transcript || '');
      setStatus('done');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to transcribe video';
      setError(message);
      setStatus('error');
    }
  };

  const isBusy = status === 'downloading' || status === 'transcribing';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Video URL</label>
      <input
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=... or TikTok/Instagram/Vimeo URL"
        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={startTranscription}
          disabled={isBusy || !videoUrl.trim()}
          className="px-5 py-2 rounded-lg bg-[#1E3A8A] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'downloading' && 'Downloading video…'}
          {status === 'transcribing' && 'Transcribing audio…'}
          {status === 'idle' && 'Start Transcription'}
          {status === 'done' && 'Done!'}
          {status === 'error' && 'Retry'}
        </button>
        {status !== 'idle' && status !== 'error' && (
          <span className="text-sm text-slate-500">
            {status === 'downloading' && 'Fetching audio…'}
            {status === 'transcribing' && 'Processing with AI…'}
            {status === 'done' && 'Completed'}
          </span>
        )}
      </div>
      {error && (
        <div className={`p-4 rounded-lg border text-sm space-y-3 ${
          error.includes('Backend') || error.includes('backend') 
            ? 'border-red-200 bg-red-50 text-red-900' 
            : 'border-blue-200 bg-blue-50 text-blue-900'
        }`}>
          <div className="flex items-start gap-2">
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              error.includes('Backend') || error.includes('backend') 
                ? 'text-red-600' 
                : 'text-blue-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className={`font-semibold mb-2 ${
                error.includes('Backend') || error.includes('backend') 
                  ? 'text-red-900' 
                  : 'text-blue-900'
              }`}>
                {error.includes('Backend') || error.includes('backend') 
                  ? 'Backend Error' 
                  : 'YouTube URL Transcription'}
              </div>
              <p className={`text-sm whitespace-pre-line ${
                error.includes('Backend') || error.includes('backend') 
                  ? 'text-red-800' 
                  : 'text-blue-800'
              }`}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


