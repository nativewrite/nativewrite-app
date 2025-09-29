export const metadata = {
	title: "Login | NativeWrite",
	description: "Access your NativeWrite dashboard to humanize content, transcribe audio, and write books.",
};

export default function LoginPage() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-6 py-16">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-8 shadow-sm text-center">
				<h1 className="text-2xl font-semibold text-slate-900">Login</h1>
				<p className="mt-2 text-slate-600">Authentication coming soon.</p>
				<a href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition">
					Go to Dashboard
				</a>
			</div>
		</main>
	);
}
