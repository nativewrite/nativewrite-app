"use client";

import { useState } from 'react';

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to humanize');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/humanizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      const data = await response.json();
      
      if (data.success) {
        setOutputText(data.humanizedText);
      } else {
        alert(data.error || 'Failed to humanize text');
      }
    } catch {
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
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Humanizer</h1>
          <p className="text-slate-600">Transform AI-generated text into natural, human-like writing that passes detection tools.</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label htmlFor="input-text" className="block text-sm font-medium text-slate-700 mb-2">
                Paste your AI-generated text here
              </label>
              <textarea
                id="input-text"
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="Enter your AI-generated text..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Character count: {inputText.length}
              </div>
              <button 
                onClick={handleHumanize}
                disabled={isLoading}
                className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Humanizing...' : 'Humanize Text'}
              </button>
            </div>

            <div>
              <label htmlFor="output-text" className="block text-sm font-medium text-slate-700 mb-2">
                Humanized result
              </label>
              <textarea
                id="output-text"
                rows={8}
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"
                placeholder="Your humanized text will appear here..."
              />
            </div>

            <div className="flex gap-4">
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
          </div>
        </div>
      </div>
    </main>
  );
}
