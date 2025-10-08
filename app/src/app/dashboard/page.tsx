"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [showTranscribeMenu, setShowTranscribeMenu] = useState(false);

  const features = [
    {
      id: 'humanizer',
      title: '🧍 Humanize',
      description: 'Make AI text sound more natural and human',
      href: '/dashboard/humanizer',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'transcriber',
      title: '🗣️ Transcribe',
      description: 'Convert audio/video to text with AI',
      href: '/dashboard/transcriber',
      gradient: 'from-blue-500 to-cyan-500',
      hasDropdown: true
    },
    {
      id: 'rephrase',
      title: '✍️ Rephrase',
      description: 'Rewrite text in different tones',
      href: '/dashboard/rephrase',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'bookwriter',
      title: '📚 Book Write',
      description: 'AI-assisted book writing tool',
      href: '/dashboard/bookwriter',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent">
              NativeWrite
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/humanizer"
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-[#1E3A8A] transition-colors font-medium"
              >
                🧍 Humanize
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowTranscribeMenu(!showTranscribeMenu)}
                  className="px-4 py-2 rounded-lg text-slate-700 hover:text-[#1E3A8A] transition-colors font-medium flex items-center gap-1"
                >
                  🗣️ Transcribe
                  <svg className={`w-4 h-4 transition-transform ${showTranscribeMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTranscribeMenu && (
                  <div className="absolute top-full mt-2 right-0 w-48 rounded-lg backdrop-blur-lg bg-white/90 shadow-xl border border-white/20 overflow-hidden">
                    <Link 
                      href="/dashboard/transcriber"
                      className="block px-4 py-3 text-slate-700 hover:bg-[#1E3A8A]/10 transition-colors"
                      onClick={() => setShowTranscribeMenu(false)}
                    >
                      🗂 Upload File
                    </Link>
                    <Link 
                      href="/dashboard/transcriber?mode=url"
                      className="block px-4 py-3 text-slate-700 hover:bg-[#1E3A8A]/10 transition-colors"
                      onClick={() => setShowTranscribeMenu(false)}
                    >
                      🔗 Video URL
                    </Link>
                    <Link 
                      href="/dashboard/transcriber?mode=record"
                      className="block px-4 py-3 text-slate-700 hover:bg-[#1E3A8A]/10 transition-colors"
                      onClick={() => setShowTranscribeMenu(false)}
                    >
                      🎙 Record & Scribe
                    </Link>
                  </div>
                )}
              </div>
              
              <Link 
                href="/dashboard/rephrase"
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-[#1E3A8A] transition-colors font-medium"
              >
                ✍️ Rephrase
              </Link>
              
              <Link 
                href="/dashboard/bookwriter"
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-[#1E3A8A] transition-colors font-medium"
              >
                📚 Book Write
              </Link>
              
              <Link 
                href="/history"
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-[#1E3A8A] transition-colors font-medium"
              >
                📜 History
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Welcome to <span className="bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent">NativeWrite</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Your all-in-one AI writing assistant. Humanize text, transcribe audio, rephrase content, and write books with cutting-edge AI.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                    <span className="text-3xl">{feature.title.split(' ')[0]}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title.split(' ').slice(1).join(' ')}
                  </h3>
                  
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </div>
                
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-r ${feature.gradient} pointer-events-none`}></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mx-auto max-w-7xl mt-20">
          <div className="rounded-2xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent mb-2">
                  10,000+
                </div>
                <div className="text-slate-600">Documents Processed</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent mb-2">
                  5,000+
                </div>
                <div className="text-slate-600">Hours Transcribed</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-slate-600">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mx-auto max-w-4xl mt-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Powered by <span className="bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent">OpenAI GPT-4o</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Real-time Processing</h3>
                  <p className="text-sm text-slate-600">Get instant results with our optimized AI pipeline</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Multi-language Support</h3>
                  <p className="text-sm text-slate-600">Work with content in 50+ languages</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Secure & Private</h3>
                  <p className="text-sm text-slate-600">Your data is encrypted and never stored</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Export Anywhere</h3>
                  <p className="text-sm text-slate-600">Download in TXT, SRT, DOCX, and PDF formats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}