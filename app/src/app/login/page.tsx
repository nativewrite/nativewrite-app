"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-6 py-16">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-8 shadow-sm text-center">
				<h1 className="text-2xl font-semibold text-slate-900">Login</h1>
				<p className="mt-2 text-slate-600">Continue with Google.</p>
				<button
					onClick={() => signIn("google")}
					className="mt-6 inline-flex items-center justify-center rounded-md bg-[#1E3A8A] text-white px-4 py-2 hover:bg-[#1E40AF] transition shadow"
				>
					Sign in with Google
				</button>
			</div>
		</main>
	);
}
