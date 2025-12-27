"use client";

import { useState } from 'react';
import ScoreGauge from '@/components/ScoreGauge';
import ScoreBar from '@/components/ScoreBar';
import BeforeAfterPanel from '@/components/BeforeAfterPanel';

interface Score {
  naturalness: number;
  predictability_index: number;
  burstiness_index: number;
  readability: number;
  repetition_density: number;
}

interface Report {
  before: Score;
  after: Score;
  delta: {
    naturalness: number;
    predictability_index: number;
    burstiness_index: number;
    readability: number;
    repetition_density: number;
  };
}

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [mode, setMode] = useState<'standard' | 'academic' | 'business' | 'narrative'>('standard');

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to humanize');
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const response = await fetch('/api/humanizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText,
          lang,
          mode,
          strict_meaning: 'high',
          voice_strength: 50,
          preserve_keywords: [],
          avoid_phrases: [],
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOutputText(data.humanizedText);
        if (data.report) {
          setReport(data.report);
        }
      } else {
        alert(data.error || 'Failed to humanize text');
      }
    } catch (error) {
      console.error('Humanization error:', error);
      alert('Failed to humanize text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(outputText);
    alert('Copied to clipboard!');
  };

  const downloadResult = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humanized-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Humanizer</h1>
          <p className="text-slate-600">Transform AI-generated text into natural, human-like writing with visible before/after scoring.</p>
        </div>

        {/* Language and Mode Selection */}
        <div className="mb-6 flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'fa')}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="en">English</option>
              <option value="fa">Persian / Farsi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="standard">Standard</option>
              <option value="academic">Academic</option>
              <option value="business">Business</option>
              <option value="narrative">Narrative</option>
            </select>
          </div>
        </div>

        {/* Main Editor Section */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Textarea */}
            <div>
              <label htmlFor="input-text" className="block text-sm font-medium text-slate-700 mb-2">
                Original Text
              </label>
              <textarea
                id="input-text"
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent resize-none"
                placeholder="Enter your AI-generated text..."
              />
            </div>

            {/* Output Textarea */}
            <div>
              <label htmlFor="output-text" className="block text-sm font-medium text-slate-700 mb-2">
                Humanized Result
              </label>
              <textarea
                id="output-text"
                rows={12}
                value={outputText}
                readOnly
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 resize-none"
                placeholder="Your humanized text will appear here..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-500">
              Character count: {inputText.length}
            </div>
            <button 
              onClick={handleHumanize}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Humanizing...' : 'Humanize'}
            </button>
          </div>

          {outputText && (
            <div className="flex gap-4 mt-4">
              <button 
                onClick={copyResult}
                disabled={!outputText}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copy Result
              </button>
              <button 
                onClick={downloadResult}
                disabled={!outputText}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download as TXT
              </button>
            </div>
          )}
        </div>

        {/* Score Visualization Section */}
        {report && (
          <div className="space-y-6">
            {/* Score Gauges (Naturalness & Predictability) */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Score Visualization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <ScoreGauge
                  value={report.after.naturalness}
                  max={100}
                  label="Naturalness Score (estimated)"
                />
                <ScoreGauge
                  value={report.after.predictability_index}
                  max={200}
                  label="Predictability Index"
                  unit=""
                />
              </div>

              {/* Score Bars */}
              <div className="space-y-4">
                <ScoreBar
                  value={report.after.burstiness_index}
                  max={300}
                  label="Sentence Variety"
                  unit=""
                />
                <ScoreBar
                  value={report.after.readability}
                  max={100}
                  label="Readability"
                  unit=""
                />
                <ScoreBar
                  value={report.after.repetition_density}
                  max={100}
                  label="Repetition Density"
                  unit=""
                  reverse
                />
              </div>
            </div>

            {/* Before/After Comparison Panel */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Before / After Comparison</h2>
              <BeforeAfterPanel
                before={report.before}
                after={report.after}
                delta={report.delta}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
