"use client";

import { useEffect, useRef, useState } from "react";
import { useFocus } from "@/context/FocusContext";

export default function AudioManager() {
  const [enabled, setEnabled] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const { enabled: focusEnabled } = useFocus();

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("nativewrite-sound") : null;
    if (saved === "true") setEnabled(true);
  }, []);

  useEffect(() => {
    if (!ambientRef.current) return;
    ambientRef.current.volume = focusEnabled ? 0.12 : 0.08;
    if (enabled) {
      ambientRef.current.play().catch(() => {});
    } else {
      ambientRef.current.pause();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem("nativewrite-sound", String(enabled));
    }
  }, [enabled]);

  return (
    <>
      <audio ref={ambientRef} loop src="/sounds/ambient.mp3" />
      <button
        onClick={() => setEnabled(!enabled)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full backdrop-blur-md bg-white/60 shadow-lg border border-white/30 flex items-center justify-center hover:scale-105 transition"
        title={enabled ? "Disable ambient sound" : "Enable ambient sound"}
      >
        {enabled ? "🔊" : "🔈"}
      </button>
    </>
  );
}


