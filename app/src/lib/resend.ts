import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string) {
  if (!process.env.RESEND_API_KEY) return { id: "mock", error: null };
  return resend.emails.send({
    from: "Nativewrite <hello@nativewrite.app>",
    to,
    subject: "Welcome to Nativewrite",
    html: "<p>Thanks for joining Nativewrite!</p>",
  });
}



