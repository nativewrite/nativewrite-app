"use client";

import AmbientBackground from "@/components/ui/AmbientBackground";
import AudioManager from "@/components/ui/AudioManager";
import { FocusProvider } from "@/context/FocusContext";
import FocusToggle from "@/components/ui/FocusToggle";
import FocusEditor from "@/components/ui/FocusEditor";
import { motion } from "framer-motion";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <FocusProvider>
      <AmbientBackground />
      <AudioManager />
      <FocusToggle />
      <motion.div animate={{ filter: "none" }}>{children}</motion.div>
      <FocusEditor />
    </FocusProvider>
  );
}


