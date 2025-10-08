import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center px-6">
      <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-[0_0_30px_rgba(30,58,138,0.3)]">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-white mb-4">Link Not Found</h1>
        <p className="text-white/70 mb-6 max-w-md">
          This transcript either doesn&apos;t exist or has been made private by the owner.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}

