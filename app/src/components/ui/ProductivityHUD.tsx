"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useFocus } from "@/context/FocusContext";

export default function ProductivityHUD({ text }: { text: string }) {
  const { enabled } = useFocus();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(words / 200);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = Math.min((words / 500) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_0_25px_rgba(30,58,138,0.4)] flex items-center gap-8"
    >
      <motion.svg className="w-16 h-16" viewBox="0 0 100 100" whileHover={{ scale: 1.02 }}>
        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50" cy="50" r="45"
          stroke="url(#grad)"
          strokeWidth="8"
          strokeDasharray="282"
          strokeDashoffset={282 - (progress / 100) * 282}
          strokeLinecap="round"
          fill="none"
          animate={{ strokeDashoffset: 282 - (progress / 100) * 282 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 10px rgba(30,58,138,0.5))" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>
        </defs>
      </motion.svg>

      <div className="flex flex-col text-white font-light">
        <p className="text-lg tracking-wide">⏱ {minutes}:{secs.toString().padStart(2, "0")}</p>
        <p className="text-sm opacity-80">{words} words • {readingTime} min read</p>
      </div>
    </motion.div>
  );
}


