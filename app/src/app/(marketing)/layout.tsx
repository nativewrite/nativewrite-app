import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Nativewrite — AI Writing Platform",
  description: "Humanizer, Transcriber, Book Writer",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}



