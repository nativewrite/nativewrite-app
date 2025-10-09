"use client";

import { useState } from 'react';

type Props = {
  onTranscript: (text: string) => void;
  language?: string;
};

export default function VideoURLUploader({ onTranscript, language = 'auto' }: Props) {
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'transcribing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const startTranscription = async () => {
    if (!videoUrl.trim()) return;
    setError('');
    setStatus('downloading');
    try {
      // Use universal URL transcription endpoint for any URL
      const res = await fetch('/api/transcribe/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: videoUrl, 
          language
        })
      });

      setStatus('transcribing');

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to transcribe');
      }

      onTranscript(data.text || '');
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
        placeholder="Any audio/video URL: YouTube, TikTok, Instagram, Vimeo, MP3, MP4, etc."
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
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          {error.includes('blocks direct downloads')
            ? "This platform doesn’t allow direct transcription. Please upload your file instead."
            : error}
        </div>
      )}
    </div>
  );
}


