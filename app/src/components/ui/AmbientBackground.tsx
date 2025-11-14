"use client";

import { motion } from "framer-motion";

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9FAFB] via-[#E8ECF8] to-[#DDE9F9]" />

      {/* Animated Tesla lights */}
      <motion.div
        className="absolute -top-1/2 left-1/3 w-[90vw] h-[90vh] bg-gradient-radial from-[#1E3A8A]/30 via-transparent to-transparent blur-3xl"
        animate={{ x: ["0%", "5%", "-5%", "0%"], y: ["0%", "5%", "-3%", "0%"], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-[70vw] h-[70vh] bg-gradient-radial from-[#00B4D8]/25 via-transparent to-transparent blur-3xl"
        animate={{ x: ["0%", "-4%", "6%", "0%"], y: ["0%", "-3%", "3%", "0%"], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Optional top reflection */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4),transparent_60%)] mix-blend-overlay pointer-events-none" />
    </div>
  );
}



