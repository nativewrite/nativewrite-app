import Link from "next/link";

export const metadata = {
  title: "NativeWrite — Humanize, Transcribe, Create.",
  description: "Advanced AI tools for creators, students, and professionals. Humanize AI text, transcribe audio, and write books with NativeWrite.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            NativeWrite
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Humanize, Transcribe, Create.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center px-8 py-4 bg-[#1E3A8A] text-white text-lg font-semibold rounded-xl hover:bg-[#1E40AF] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Try Free →
          </Link>
        </div>
      </section>

      {/* Features Preview */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Humanizer Card */}
            <Link href="/dashboard/humanizer" className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Humanizer</h3>
                <p className="text-slate-600 leading-relaxed">
                  Transform AI-generated text into natural, human-like writing that passes detection tools.
                </p>
              </div>
            </Link>

            {/* Transcriber Card */}
            <Link href="/dashboard/transcriber" className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Transcriber</h3>
                <p className="text-slate-600 leading-relaxed">
                  Convert audio to text with speaker detection and export to Word, PDF, or SRT.
                </p>
              </div>
            </Link>

            {/* Book Writer Card */}
            <Link href="/dashboard/bookwriter" className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Book Writer</h3>
                <p className="text-slate-600 leading-relaxed">
                  AI-assisted book creation with chapter planning, writing, and professional export.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Creators</h2>
            <p className="text-slate-600 text-lg">
              Join thousands of writers, students, and professionals who use NativeWrite to create better content.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200/50">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-slate-900 mb-4 md:mb-0">NativeWrite</div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">Home</Link>
              <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}