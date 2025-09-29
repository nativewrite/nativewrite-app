export const metadata = {
	title: "About NativeWrite | AI Writing Tools",
	description: "Our mission: help writers and teams make AI content truly human. Learn how NativeWrite works.",
};

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-20">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl md:text-5xl font-semibold text-slate-900">About NativeWrite</h1>
				<p className="mt-3 text-slate-600">Advanced AI Humanizer, Transcriber, and Book Writer.</p>

				<section className="mt-10 space-y-8">
					<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">Our Vision</h2>
						<p className="mt-2 text-slate-600">Helping writers, students, and professionals make AI text natural, persuasive, and publication-ready.</p>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">Technology</h2>
						<p className="mt-2 text-slate-600">We combine state-of-the-art language models with custom heuristics to humanize tone, improve flow, and preserve meaning. Transcription is powered by best-in-class speech APIs. Book Writer assembles structure and exports professionally.</p>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">Why NativeWrite</h2>
						<p className="mt-2 text-slate-600">Premium UI, privacy-first processing, and export-ready outputs. Built for creators who value polish and speed.</p>
					</div>
				</section>
			</div>
		</main>
	);
}
