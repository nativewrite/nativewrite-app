import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
	throw new Error("Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
}

if (!authSecret) {
	throw new Error("Missing NextAuth secret. Please set AUTH_SECRET or NEXTAUTH_SECRET.");
}

export const authOptions: AuthOptions = {
	secret: authSecret,
	session: {
		strategy: "jwt",
	},
	providers: [
		GoogleProvider({
			clientId: googleClientId,
			clientSecret: googleClientSecret,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			// Allow all Google sign-ins
			return true;
		},
		async redirect({ url, baseUrl }) {
			// Handle relative URLs
			if (url.startsWith("/")) {
				return `${baseUrl}${url}`;
			}
			// Handle absolute URLs from the same origin
			try {
				const targetOrigin = new URL(url).origin;
				if (targetOrigin === baseUrl) {
					return url;
				}
			} catch {
				// ignore malformed URLs and fall through to baseUrl
			}
			// Default redirect to dashboard
			return `${baseUrl}/dashboard`;
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	debug: process.env.NODE_ENV === "development",
};


