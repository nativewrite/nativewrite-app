"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Transcription {
  id: string;
  created_at: string;
  source_type: string;
  detected_language: string;
  transcript_text: string;
  translation_text?: string;
  target_language?: string;
  audio_url?: string;
  tts_url?: string;
  duration_seconds?: number;
}

export default function HistoryPage() {
  const session = useSession();
  const [items, setItems] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upload' | 'record' | 'url'>('all');

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadHistory = async () => {
    if (!session?.data?.user?.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq('user_id', session.data.user.email)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(data);
      } else if (error) {
        console.error('Error loading history:', error);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcription?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from("transcriptions")
        .delete()
        .eq("id", id);

      if (!error) {
        setItems(items.filter((item) => item.id !== id));
      } else {
        console.error('Error deleting transcription:', error);
        alert('Failed to delete transcription');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete transcription');
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
    return languages[code] || code.toUpperCase();
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'upload': return '📁';
      case 'record': return '🎙️';
      case 'url': return '🔗';
      default: return '📄';
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.source_type === filter);

  if (!session || !session.data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] pt-20 pb-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-[0_0_30px_rgba(30,58,138,0.3)]"
          >
            <h1 className="text-3xl font-bold text-white mb-4">🔒 Authentication Required</h1>
            <p className="text-white/70 mb-6">Please sign in to view your transcription history</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Sign In
            </a>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] pt-20 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">📜 Transcription History</h1>
          <p className="text-white/70">View, download, and manage your transcriptions</p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'upload', label: '📁 Uploads' },
            { key: 'record', label: '🎙️ Recordings' },
            { key: 'url', label: '🔗 URLs' },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === filterOption.key
                  ? 'bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white shadow-[0_0_15px_rgba(30,58,138,0.4)]'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white/70 mt-4">Loading history...</p>
          </motion.div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No transcriptions yet</h2>
            <p className="text-white/60 mb-6">Start transcribing audio to see your history here</p>
            <a
              href="/dashboard/transcriber"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Go to Transcriber
            </a>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(30,58,138,0.2)] hover:shadow-[0_0_30px_rgba(30,58,138,0.3)] transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSourceIcon(item.source_type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/90">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                          {item.duration_seconds && (
                            <span className="text-xs text-white/60">
                              • {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white/80 inline-block mt-1">
                          {getLanguageName(item.detected_language)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-all duration-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* Transcript */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white/90">Transcript:</h3>
                      <button
                        onClick={() => downloadText(item.transcript_text, `transcript-${item.id}.txt`)}
                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-all"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                    <p className="text-white/80 bg-white/5 p-4 rounded-lg leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                      {item.transcript_text}
                    </p>
                  </div>

                  {/* Translation */}
                  {item.translation_text && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white/90">
                          Translation ({getLanguageName(item.target_language || 'en')}):
                        </h3>
                        <button
                          onClick={() => downloadText(item.translation_text!, `translation-${item.id}.txt`)}
                          className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-all"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                      <p className="text-white/80 bg-gradient-to-br from-white/5 to-white/10 p-4 rounded-lg leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        {item.translation_text}
                      </p>
                    </motion.div>
                  )}

                  {/* TTS Indicator */}
                  {item.tts_url && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>🔊</span>
                      <span>Text-to-speech generated</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </main>
  );
}

