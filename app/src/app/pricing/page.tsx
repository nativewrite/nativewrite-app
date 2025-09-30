"use client";

const plans = [
  { name: "Free", price: "$0", period: "forever", description: "Perfect for trying out NativeWrite", features: ["500 characters/day humanization","1 transcription per day","Basic export formats","Community support"], priceId: null, cta: "Get Started Free", popular: false },
  { name: "Pro", price: "$19", period: "per month", description: "For content creators and professionals", features: ["50,000 characters/month","Unlimited transcriptions","Book Writer access","Advanced export formats","Priority support"], priceId: "price_pro_replace", cta: "Start Pro Trial", popular: true },
  { name: "Pro+", price: "$49", period: "per month", description: "For teams and power users", features: ["250,000+ characters/month","My Style AI training","Claude-powered rewrites","Team collaboration","API access","White-label options"], priceId: "price_pro_plus_replace", cta: "Upgrade to Pro+", popular: false },
];

async function startCheckout(priceId: string | null) {
  if (!priceId) {
    window.location.href = "/login";
    return;
  }
  const email = window.prompt("Enter your email for checkout") || "";
  const res = await fetch("/api/checkout/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, email }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pt-20 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Simple Pricing</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your workflow. Start free, upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-[#1E3A8A] scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#1E3A8A] text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-slate-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-[#1E3A8A] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => startCheckout(plan.priceId)} className={`w-full block text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${plan.popular ? 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF] shadow-lg hover:shadow-xl' : 'bg-white/20 text-slate-900 hover:bg-white/30 border border-white/30'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">What happens to my data?</h3>
              <p className="text-slate-600">Your data is always safe. We never share your content and use enterprise-grade security.</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Do you offer refunds?</h3>
              <p className="text-slate-600">We offer a 30-day money-back guarantee for all paid plans. No questions asked.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
