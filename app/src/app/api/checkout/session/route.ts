import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
	try {
		const { priceId, email } = await req.json();

		if (!email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const checkout = await stripe.checkout.sessions.create({
			mode: "subscription",
			payment_method_types: ["card"],
			customer_email: email,
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard?success=true`,
			cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pricing?canceled=true`,
		});

		return NextResponse.json({ url: checkout.url });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
