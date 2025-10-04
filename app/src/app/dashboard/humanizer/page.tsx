export const metadata = {
  title: "Humanizer | NativeWrite Dashboard",
  description: "Transform AI-generated text into natural, human-like writing.",
};

export default function HumanizerPage() {
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
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="Enter your AI-generated text..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Character count: <span id="char-count">0</span>
              </div>
              <button className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium">
                Humanize Text
              </button>
            </div>

            <div>
              <label htmlFor="output-text" className="block text-sm font-medium text-slate-700 mb-2">
                Humanized result
              </label>
              <textarea
                id="output-text"
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"
                placeholder="Your humanized text will appear here..."
                readOnly
              />
            </div>

            <div className="flex gap-4">
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Copy Result
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Download as TXT
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
