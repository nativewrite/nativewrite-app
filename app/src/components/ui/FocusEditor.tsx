"use client";

import { useFocus } from "@/context/FocusContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { playSound } from "@/lib/sound";
import ProductivityHUD from "@/components/ui/ProductivityHUD";

export default function FocusEditor() {
  const { enabled } = useFocus();
  const [text, setText] = useState("");

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]/90 text-white p-10"
        >
          <textarea
            className="w-full h-[80vh] max-w-3xl text-xl p-6 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 focus:outline-none shadow-[0_0_20px_rgba(30,58,138,0.3)]"
            placeholder="Start writing..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              playSound("typing.mp3", 0.1);
            }}
          />
          <ProductivityHUD text={text} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


