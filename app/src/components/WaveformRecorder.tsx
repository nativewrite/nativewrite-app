"use client";

import { useState, useRef, useEffect } from 'react';

type Props = {
  onTranscript: (text: string) => void;
  onAudioRecorded?: (audio: { blob: Blob; url: string }) => void;
  language?: string;
};

export default function WaveformRecorder({ onTranscript, onAudioRecorded, language = 'auto' }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Setup audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
        
        animationRef.current = requestAnimationFrame(monitorAudioLevel);
      };
      monitorAudioLevel();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    setIsRecording(false);
    setIsProcessing(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    mediaRecorderRef.current.stop();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Wait for recording to finish
    await new Promise<void>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => resolve();
      } else {
        resolve();
      }
    });

    // Process the audio
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    const audioData = { blob: audioBlob, url };
    setRecordedAudio(audioData);
    if (onAudioRecorded) {
      onAudioRecorded(audioData);
    }
    await transcribeAudio(audioBlob);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);

      const response = await fetch('/api/transcriber', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setTranscript(data.text);
        onTranscript(data.text);
      } else {
        throw new Error(data.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWaveformBars = () => {
    const bars = [];
    const barCount = 32;
    const baseHeight = 4;
    const maxHeight = 32;
    
    for (let i = 0; i < barCount; i++) {
      const height = isRecording 
        ? baseHeight + (audioLevel * maxHeight * Math.random())
        : baseHeight;
      
      bars.push(
        <div
          key={i}
          className="bg-[#1E3A8A] rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            width: '3px',
            opacity: isRecording ? 0.8 + (audioLevel * 0.2) : 0.3
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="space-y-6">
      {/* Waveform Visualization */}
      <div className="flex items-center justify-center h-20 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-end gap-1 h-16">
          {getWaveformBars()}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {isRecording ? formatTime(recordingTime) : '00:00'}
          </div>
          <div className="text-sm text-slate-500">
            {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Ready to record'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isRecording && !isProcessing ? (
            <button
              onClick={startRecording}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          ) : isRecording ? (
            <button
              onClick={stopRecording}
              className="w-16 h-16 bg-slate-600 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </button>
          ) : (
            <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-sm">
          {isRecording && (
            <div className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording</span>
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-1 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Transcribing</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript Preview */}
      {transcript && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-2">Live Transcript:</div>
            <div className="text-slate-600 whitespace-pre-wrap">{transcript}</div>
          </div>

          {recordedAudio && (
            <div className="p-4 rounded-2xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg flex items-center justify-between transition-all">
              <div className="relative w-full mr-4">
                <div className="relative w-full h-[60px] bg-gradient-to-r from-[#1E3A8A]/20 to-[#00B4D8]/10 rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[#1E3A8A]/20 to-transparent blur-lg"></div>
                  <audio controls src={recordedAudio.url} className="z-10 w-3/4 filter drop-shadow-[0_0_6px_rgba(30,58,138,0.4)]" />
                </div>
              </div>
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
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-slate-500">
        <p>Click the microphone to start recording</p>
        <p className="text-xs mt-1">Your browser will ask for microphone permission</p>
      </div>
    </div>
  );
}
