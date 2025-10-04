export const metadata = {
  title: "Book Writer | NativeWrite Dashboard",
  description: "AI-assisted book creation with chapter planning and professional export.",
};

export default function BookWriterPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Book Writer</h1>
          <p className="text-slate-600">AI-assisted book creation with chapter planning, writing, and professional export.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Planning */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Book Planning</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="book-title" className="block text-sm font-medium text-slate-700 mb-2">
                  Book Title
                </label>
                <input
                  type="text"
                  id="book-title"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Enter your book title..."
                />
              </div>

              <div>
                <label htmlFor="book-genre" className="block text-sm font-medium text-slate-700 mb-2">
                  Genre
                </label>
                <select
                  id="book-genre"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                >
                  <option value="">Select genre...</option>
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="mystery">Mystery</option>
                  <option value="romance">Romance</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="fantasy">Fantasy</option>
                </select>
              </div>

              <div>
                <label htmlFor="book-outline" className="block text-sm font-medium text-slate-700 mb-2">
                  Book Outline
                </label>
                <textarea
                  id="book-outline"
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Describe your book concept, main characters, plot points..."
                />
              </div>

              <button className="w-full px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium">
                Generate Chapter Plan
              </button>
            </div>
          </div>

          {/* Chapter Writing */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Chapter Writing</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="chapter-title" className="block text-sm font-medium text-slate-700 mb-2">
                  Chapter Title
                </label>
                <input
                  type="text"
                  id="chapter-title"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Chapter 1: The Beginning..."
                />
              </div>

              <div>
                <label htmlFor="chapter-content" className="block text-sm font-medium text-slate-700 mb-2">
                  Chapter Content
                </label>
                <textarea
                  id="chapter-content"
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Start writing your chapter..."
                />
              </div>

              <div className="flex gap-4">
                <button className="flex-1 px-4 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium">
                  AI Assist
                </button>
                <button className="flex-1 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Save Chapter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Export Options</h2>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Export as EPUB
            </button>
            <button className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Export as PDF
            </button>
            <button className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Export as DOCX
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
