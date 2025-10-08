"use client";

import { useFocus } from "@/context/FocusContext";

export default function FocusToggle() {
  const { enabled, toggle } = useFocus();
  return (
    <button
      onClick={toggle}
      className="fixed top-5 right-5 z-50 w-12 h-12 rounded-full backdrop-blur-md bg-white/60 shadow-lg border border-white/30 flex items-center justify-center hover:scale-105 transition"
      title={enabled ? "Exit Focus Mode" : "Enter Focus Mode"}
    >
      {enabled ? "🌕" : "🌑"}
    </button>
  );
}


