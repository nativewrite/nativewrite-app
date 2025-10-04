export const metadata = {
  title: "Transcriber | NativeWrite Dashboard",
  description: "Convert audio to text with speaker detection and export options.",
};

export default function TranscriberPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Transcriber</h1>
          <p className="text-slate-600">Convert audio to text with speaker detection and export to Word, PDF, or SRT.</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label htmlFor="audio-upload" className="block text-sm font-medium text-slate-700 mb-2">
                Upload audio file
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#1E3A8A] transition-colors">
                <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-600 mb-2">Drop your audio file here, or click to browse</p>
                <p className="text-sm text-slate-500">Supports MP3, WAV, M4A, and more</p>
                <input type="file" id="audio-upload" className="hidden" accept="audio/*" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                File: <span id="file-name">No file selected</span>
              </div>
              <button className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium">
                Start Transcription
              </button>
            </div>

            <div>
              <label htmlFor="transcript" className="block text-sm font-medium text-slate-700 mb-2">
                Transcript
              </label>
              <textarea
                id="transcript"
                rows={12}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"
                placeholder="Your transcript will appear here..."
                readOnly
              />
            </div>

            <div className="flex gap-4">
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Export as SRT
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Export as DOCX
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
