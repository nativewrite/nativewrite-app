"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check for error in URL params (from NextAuth)
		const errorParam = searchParams?.get("error");
		if (errorParam) {
			setError(
				errorParam === "AccessDenied"
					? "Access denied. Please try again or contact support."
					: errorParam === "Configuration"
					? "There is a problem with the server configuration. Please contact support."
					: errorParam === "Verification"
					? "The verification token has expired or has already been used."
					: "An error occurred during login. Please try again."
			);
		}
	}, [searchParams]);

	const handleSignIn = async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await signIn("google", {
				callbackUrl: "/dashboard",
				redirect: true,
			});

			// If redirect is false, check for errors
			if (result?.error) {
				setError(`Login failed: ${result.error}`);
				setLoading(false);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An unexpected error occurred. Please try again."
			);
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-6 py-16">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-8 shadow-sm text-center">
				<h1 className="text-2xl font-semibold text-slate-900">Login</h1>
				<p className="mt-2 text-slate-600">Continue with Google.</p>
				{error && (
					<div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
						{error}
					</div>
				)}
				<button
					onClick={handleSignIn}
					disabled={loading}
					className="mt-6 inline-flex items-center justify-center rounded-md bg-[#1E3A8A] text-white px-4 py-2 hover:bg-[#1E40AF] transition shadow disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
				>
					{loading ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Signing in...
						</>
					) : (
						"Sign in with Google"
					)}
				</button>
			</div>
		</main>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={
			<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-6 py-16">
				<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-8 shadow-sm text-center">
					<h1 className="text-2xl font-semibold text-slate-900">Login</h1>
					<p className="mt-2 text-slate-600">Loading...</p>
				</div>
			</main>
		}>
			<LoginForm />
		</Suspense>
	);
}
