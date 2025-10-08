import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSharedTranscription(publicId: string) {
  const { data, error } = await supabase
    .from("transcriptions")
    .select("*")
    .eq("public_id", publicId)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function SharedPage({ params }: PageProps) {
  const { id } = await params;
  const transcription = await getSharedTranscription(id);

  if (!transcription) {
    notFound();
  }

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span>🔗</span>
            <span>Shared Transcript</span>
          </h1>
          <p className="text-white/60">Powered by NativeWrite</p>
        </div>

        {/* Main Content Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(30,58,138,0.2)]">
          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-6 text-sm text-white/70">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
              🌐 {getLanguageName(transcription.detected_language)}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
              📅 {new Date(transcription.created_at).toLocaleDateString()}
            </span>
            {transcription.duration_seconds && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                ⏱️ {Math.floor(transcription.duration_seconds / 60)}:{(transcription.duration_seconds % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          {/* Transcript */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span>📝</span>
              <span>Transcript</span>
            </h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <pre className="whitespace-pre-wrap text-white/90 leading-relaxed font-sans">
                {transcription.transcript_text}
              </pre>
            </div>
          </div>

          {/* Translation */}
          {transcription.translation_text && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <span>🌍</span>
                <span>Translation ({getLanguageName(transcription.target_language || 'en')})</span>
              </h2>
              <div className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-xl border border-white/10">
                <p className="text-white/90 leading-relaxed">
                  {transcription.translation_text}
                </p>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {transcription.tts_url && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <span>🔊</span>
                <span>Audio</span>
              </h2>
              <audio 
                controls 
                className="w-full rounded-lg bg-white/10 backdrop-blur-lg"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(30, 58, 138, 0.3))'
                }}
              >
                <source src={transcription.tts_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Try NativeWrite →
          </Link>
        </div>
      </div>
    </main>
  );
}

