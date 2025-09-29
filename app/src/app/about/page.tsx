import Link from "next/link";

export const metadata = {
  title: "About NativeWrite | AI Writing Tools for Creators",
  description: "Learn about NativeWrite's mission to help creators, students, and professionals make AI content truly human with advanced writing tools.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Why NativeWrite?
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            AI tools built for creators, students, and professionals who value quality, privacy, and efficiency.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-slate-600 text-center max-w-4xl mx-auto leading-relaxed">
              We believe AI should enhance human creativity, not replace it. NativeWrite helps you create content that feels genuinely human while maintaining the efficiency and scale that AI provides.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Humanizer Feature */}
            <div className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Humanizer</h3>
                <p className="text-slate-600 mb-4">Multi-language support with My Style AI training for personalized writing.</p>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li>• Passes AI detection tools</li>
                  <li>• Maintains original meaning</li>
                  <li>• Multiple writing styles</li>
                </ul>
              </div>
            </div>

            {/* Transcriber Feature */}
            <div className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Transcriber</h3>
                <p className="text-slate-600 mb-4">Record and export to Word, PDF, or SRT with speaker detection.</p>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li>• Real-time transcription</li>
                  <li>• Speaker identification</li>
                  <li>• Multiple export formats</li>
                </ul>
              </div>
            </div>

            {/* Book Writer Feature */}
            <div className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Book Writer</h3>
                <p className="text-slate-600 mb-4">AI-assisted publishing with chapter planning and professional export.</p>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li>• Chapter-by-chapter writing</li>
                  <li>• Professional formatting</li>
                  <li>• EPUB, PDF, DOCX export</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-20">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Advanced Technology</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Privacy-First Processing</h3>
                <p className="text-slate-600 mb-4">
                  Your content is processed securely with enterprise-grade encryption. We never store your data longer than necessary.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Tesla-Inspired UI</h3>
                <p className="text-slate-600 mb-4">
                  Clean, minimal interface designed for focus and productivity. Every interaction is optimized for speed and clarity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="mb-20">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">What&apos;s Coming</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">API Access</h3>
                <p className="text-sm text-slate-600">Integrate NativeWrite into your existing workflow</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Team Collaboration</h3>
                <p className="text-sm text-slate-600">Share projects and collaborate with your team</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">White-Label</h3>
                <p className="text-sm text-slate-600">Custom branding for enterprise customers</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using NativeWrite to create better content.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center px-8 py-4 bg-[#1E3A8A] text-white text-lg font-semibold rounded-xl hover:bg-[#1E40AF] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign Up Free →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
