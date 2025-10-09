"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import WaveformRecorder from '@/components/WaveformRecorder';
import VideoURLUploader from '@/components/VideoURLUploader';
import LanguageSelectModal from '@/components/ui/LanguageSelectModal';
import NativeGPTChat from '@/components/NativeGPTChat';

export default function TranscriberPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<'file' | 'url' | 'record'>('file');
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setInputType('file');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setInputType('file');
    }
  };

  const handleTranscribe = async () => {
    if (inputType === 'file' && !selectedFile) {
      alert('Please select an audio/video file first');
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (inputType === 'file' && selectedFile) {
        // Use FormData for file uploads to handle large files properly
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('language', selectedLanguage);
        formData.append('sourceType', 'upload');

        response = await fetch('/api/transcriber', {
          method: 'POST',
          body: formData
        });
      } else {
        // For other input types, use JSON
        response = await fetch('/api/transcriber', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: selectedLanguage, sourceType: inputType })
        });
      }

      const data = await response.json();
      
      if (data.success) {
        setTranscript(data.text);
        setDetectedLanguage(data.detectedLanguage || 'auto');
        setTranscriptionId(data.transcriptionId || null);

        // After success, show audio player for uploaded files
        if (inputType === 'file' && selectedFile) {
          const blob = new Blob([await selectedFile.arrayBuffer()], { type: selectedFile.type || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudio({ blob, url });
        }
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

  const handleTranslate = async () => {
    if (!transcript) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcript, 
          from: detectedLanguage || selectedLanguage, 
          to: targetLanguage,
          transcriptionId: transcriptionId
        })
      });

      const data = await response.json();
      
      if (data.translation) {
        setTranslation(data.translation);
        setShowTranslateModal(true);
      } else {
        alert(data.error || 'Failed to translate text');
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const playTranslation = async () => {
    if (!translation) return;
    
    setIsPlayingTTS(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: translation, 
          language: targetLanguage,
          transcriptionId: transcriptionId
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlayingTTS(false);
        };
        
        audio.play();
      } else {
        throw new Error('TTS failed');
      }
    } catch (error) {
      console.error('TTS error:', error);
      alert('Failed to generate speech. Please try again.');
      setIsPlayingTTS(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      auto: 'Auto Detect',
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
      fa: 'Persian',
      tr: 'Turkish',
      nl: 'Dutch',
      sv: 'Swedish',
      no: 'Norwegian',
      da: 'Danish',
      fi: 'Finnish',
    };
    return languages[code] || code;
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Transcriber</h1>
          <p className="text-slate-600">Convert any video/audio to text with AI. Supports YouTube, Instagram, TikTok, Twitter, and more!</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl"
        >
          <div className="space-y-6">
            {/* Input Type Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setInputType('file')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  inputType === 'file' 
                    ? 'bg-[#1E3A8A] text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setInputType('url')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  inputType === 'url' 
                    ? 'bg-[#1E3A8A] text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Video URL
              </button>
              <button
                onClick={() => setInputType('record')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  inputType === 'record' 
                    ? 'bg-[#1E3A8A] text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🎙 Record & Scribe
              </button>
            </div>

            {inputType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload audio/video file
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
                    <p className="text-slate-600 mb-2">Drop your audio/video file here, or click to browse</p>
                    <p className="text-sm text-slate-500">Supports MP3, WAV, M4A, MP4, AVI, and more</p>
                    <p className="text-xs text-blue-600 mt-2">✅ Real transcription with OpenAI Whisper</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : inputType === 'url' ? (
              <VideoURLUploader onTranscript={setTranscript} language={selectedLanguage} />
            ) : (
              <WaveformRecorder onTranscript={setTranscript} language={selectedLanguage} />
            )}

            {inputType === 'file' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-500">
                    File: {selectedFile ? selectedFile.name : 'No file selected'}
                  </div>
                  <button
                    onClick={() => setShowLanguageModal(true)}
                    className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-slate-700 border border-slate-300 transition-colors text-sm"
                  >
                    🌐 {getLanguageName(selectedLanguage)}
                  </button>
                </div>
                <button 
                  onClick={handleTranscribe}
                  disabled={isLoading || !selectedFile}
                  className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Transcribing...' : 'Start Transcription'}
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Transcript
                </label>
                {detectedLanguage && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Detected: {getLanguageName(detectedLanguage)}
                  </span>
                )}
              </div>
              <motion.textarea
                key={transcript}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"
                placeholder="Your transcript will appear here..."
              />

              {recordedAudio && (
                <div className="mt-6 p-4 rounded-2xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg flex items-center justify-between transition-all">
                  <audio controls src={recordedAudio.url} className="w-3/4 drop-shadow-[0_0_6px_rgba(30,58,138,0.4)]" />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = recordedAudio.url;
                        a.download = `nativewrite_recording_${new Date().toISOString()}.webm`;
                        a.click();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#1E3A8A] text-white hover:shadow-[0_0_10px_rgba(30,58,138,0.3)] transition"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(recordedAudio.url);
                        setRecordedAudio(null);
                      }}
                      className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Translation Section */}
              {transcript && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">🌍 Translation</h3>
                    <button
                      onClick={() => setShowTranslateModal(true)}
                      disabled={isTranslating}
                      className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTranslating ? 'Translating...' : '🌍 Translate Transcript'}
                    </button>
                  </div>

                  {translation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-[0_0_20px_rgba(30,58,138,0.1)]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-slate-900">
                          Translation ({getLanguageName(targetLanguage)}):
                        </h4>
                        <button
                          onClick={playTranslation}
                          disabled={isPlayingTTS}
                          className="px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
                        >
                          {isPlayingTTS ? '🔊 Playing...' : '🔊 Listen Translation'}
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{translation}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
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
        </motion.div>
      </div>

      {/* Language Selection Modal */}
      <LanguageSelectModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelect={setSelectedLanguage}
        title="🎙 Choose Audio Language"
      />

      {/* Translation Target Language Modal */}
      <LanguageSelectModal
        isOpen={showTranslateModal}
        onClose={() => setShowTranslateModal(false)}
        onSelect={(lang) => {
          setTargetLanguage(lang);
          handleTranslate();
        }}
        title="🌍 Choose Translation Language"
      />

      {/* NativeGPT Chat Assistant */}
      {transcript && (
        <NativeGPTChat
          transcriptText={transcript}
          transcriptionId={transcriptionId || undefined}
        />
      )}
    </main>
  );
}