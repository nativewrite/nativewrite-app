export const metadata = {
	title: "NativeWrite | Advanced AI Humanizer, Transcriber, and Book Writer",
	description: "Transform AI text into human-like writing, transcribe audio, and craft full books with NativeWrite.",
};

export default function Page() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
			<section className="relative px-6 pt-28 pb-20">
				<div className="mx-auto max-w-5xl text-center">
					<h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900">
						NativeWrite
					</h1>
					<p className="mt-4 text-lg md:text-xl text-slate-600">
						Advanced AI Humanizer, Transcriber, and Book Writer
					</p>
					<div className="mt-8 flex items-center justify-center gap-4">
						<a href="/login" className="rounded-md bg-slate-900 text-white px-5 py-3 text-sm md:text-base hover:bg-slate-800 transition">
							Try Free Humanizer
						</a>
						<a href="/pricing" className="rounded-md bg-white/70 backdrop-blur border border-slate-200 px-5 py-3 text-slate-700 text-sm md:text-base hover:bg-white transition">
							View Pricing
						</a>
					</div>
				</div>
			</section>

			<section className="px-6 pb-24">
				<div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-3 gap-6">
					<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-900">Humanizer</h3>
						<p className="mt-2 text-slate-600">Make AI-generated text indistinguishable from human writing.</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-900">Transcriber</h3>
						<p className="mt-2 text-slate-600">Fast, accurate transcription with speaker detection.</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-900">Book Writer</h3>
						<p className="mt-2 text-slate-600">Generate chapters and export to EPUB, PDF, and DOCX.</p>
					</div>
				</div>
				<div className="mt-12 text-center">
					<a href="/login" className="inline-flex rounded-md bg-slate-900 text-white px-6 py-3 text-sm md:text-base hover:bg-slate-800 transition">
						Get Started Free
					</a>
				</div>
			</section>
		</main>
	);
}
