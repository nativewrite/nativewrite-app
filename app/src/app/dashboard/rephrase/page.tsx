"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RephrasePage() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('standard');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const modes = [
    { value: 'standard', label: 'Standard', description: 'Clear and straightforward' },
    { value: 'professional', label: 'Professional', description: 'Formal business tone' },
    { value: 'creative', label: 'Creative', description: 'Engaging and imaginative' },
    { value: 'my-style', label: 'My Style', description: 'Personalized writing style' }
  ];

  const handleRephrase = async () => {
    if (!inputText.trim()) {
      alert('Please enter text first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, mode })
      });

      const data = await response.json();
      
      if (data.success) {
        setOutputText(data.rephrased);
      } else {
        alert(data.error || 'Rephrase failed. Try again.');
      }
    } catch {
      alert('Rephrase failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(outputText);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            ✍️ <span className="bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] bg-clip-text text-transparent">AI Rephrasing</span>
          </h1>
          <p className="text-lg text-slate-600">
            Rephrase your text naturally with different tones and styles
          </p>
        </div>

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-2xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Original Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="Paste your text here to rephrase..."
                />
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rephrasing Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {modes.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        mode === m.value
                          ? 'border-[#1E3A8A] bg-gradient-to-r from-[#1E3A8A]/10 to-[#00B4D8]/10 shadow-[0_0_12px_rgba(30,58,138,0.3)]'
                          : 'border-slate-200 hover:border-[#1E3A8A]/50 bg-white/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-slate-900">{m.label}</div>
                      <div className="text-xs text-slate-500">{m.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rephrase Button */}
              <button
                onClick={handleRephrase}
                disabled={isLoading || !inputText.trim()}
                className="relative overflow-hidden group w-full py-4 rounded-lg bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white font-medium shadow-[0_0_8px_rgba(30,58,138,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#00B4D8]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Rephrasing...</span>
                  </div>
                ) : (
                  'Rephrase Text'
                )}
              </button>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rephrased Result
                </label>
                <div className="relative">
                  <motion.textarea
                    key={outputText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gradient-to-r from-[#1E3A8A] to-[#00B4D8] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all bg-gradient-to-br from-white/70 to-blue-50/30 backdrop-blur-sm"
                    placeholder="Your rephrased text will appear here..."
                  />
                  
                  {outputText && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={copyResult}
                        className="px-3 py-1 rounded-md bg-white/80 hover:bg-white border border-slate-200 text-sm text-slate-700 hover:text-[#1E3A8A] transition-all shadow-sm"
                      >
                        {showCopied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              {outputText && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
                    <div className="text-xs text-slate-500">Original</div>
                    <div className="text-lg font-bold text-slate-900">{inputText.split(' ').length} words</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
                    <div className="text-xs text-slate-500">Rephrased</div>
                    <div className="text-lg font-bold text-slate-900">{outputText.split(' ').length} words</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 rounded-xl backdrop-blur-lg bg-white/50 border border-white/20 shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">💡 Rephrasing Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-[#1E3A8A]">✓</span>
              <span><strong>Standard:</strong> Best for everyday writing and clear communication</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E3A8A]">✓</span>
              <span><strong>Professional:</strong> Perfect for business emails and formal documents</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E3A8A]">✓</span>
              <span><strong>Creative:</strong> Great for marketing copy and engaging content</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E3A8A]">✓</span>
              <span><strong>My Style:</strong> Adapts to your unique writing voice</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
