"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function AnimatedModal({ isOpen, children, className }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={`backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg border border-white/20 ${className || ''}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


