export const metadata = {
	title: "NativeWrite Pricing Plans | Free, Basic, Pro, Ultra",
	description: "Choose the NativeWrite plan that fits your workflow: Free, Basic, Pro, or Ultra.",
};

const tiers = [
	{ name: "Free", price: "$0", features: ["Humanizer (lite)", "Basic transcription", "Export TXT"], cta: "Get Started", href: "/login" },
	{ name: "Basic", price: "$9/mo", features: ["Humanizer", "Transcription 5 hrs/mo", "Export DOCX/PDF"], cta: "Upgrade", href: "/api/stripe/checkout?plan=basic" },
	{ name: "Pro", price: "$29/mo", features: ["Advanced Humanizer", "Transcription 20 hrs/mo", "Book Writer"], cta: "Upgrade", href: "/api/stripe/checkout?plan=pro" },
	{ name: "Ultra", price: "$99/mo", features: ["All features", "Transcription 100 hrs/mo", "Priority support"], cta: "Upgrade", href: "/api/stripe/checkout?plan=ultra" },
];

export default function PricingPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-20">
			<div className="mx-auto max-w-6xl text-center">
				<h1 className="text-4xl md:text-5xl font-semibold text-slate-900">Pricing</h1>
				<p className="mt-3 text-slate-600">Simple plans that scale with you.</p>
			</div>
			<div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 md:grid-cols-4 gap-6">
				{tiers.map((t) => (
					<div key={t.name} className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 text-slate-900 shadow-sm flex flex-col">
						<h3 className="text-lg font-semibold">{t.name}</h3>
						<div className="mt-2 text-3xl font-bold">{t.price}</div>
						<ul className="mt-4 space-y-2 text-left text-slate-600 flex-1">
							{t.features.map((f) => (<li key={f}>• {f}</li>))}
						</ul>
						<a href={t.href} className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition">
							{t.cta}
						</a>
					</div>
				))}
			</div>
		</main>
	);
}
