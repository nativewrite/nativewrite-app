"use client";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useState } from "react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (languageCode: string) => void;
  title?: string;
}

export default function LanguageSelectModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  title = "🎙 Choose Audio Language" 
}: LanguageSelectModalProps) {
  const [selectedLang, setSelectedLang] = useState<string>("auto");

  const languages: Language[] = [
    { code: "auto", name: "Auto Detect", flag: "🌐" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "fa", name: "Persian", flag: "🇮🇷" },
    { code: "tr", name: "Turkish", flag: "🇹🇷" },
    { code: "nl", name: "Dutch", flag: "🇳🇱" },
    { code: "sv", name: "Swedish", flag: "🇸🇪" },
    { code: "no", name: "Norwegian", flag: "🇳🇴" },
    { code: "da", name: "Danish", flag: "🇩🇰" },
    { code: "fi", name: "Finnish", flag: "🇫🇮" },
  ];

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    onSelect(code);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <Dialog.Panel className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(30,58,138,0.3)] text-white max-w-md w-full max-h-[80vh] overflow-hidden">
            <Dialog.Title className="text-xl mb-4 font-medium text-center">
              {title}
            </Dialog.Title>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
                    selectedLang === lang.code
                      ? 'bg-gradient-to-r from-[#1E3A8A]/50 to-[#00B4D8]/50 border border-white/30 shadow-[0_0_15px_rgba(30,58,138,0.4)]'
                      : 'bg-white/10 hover:bg-white/20 border border-transparent hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {lang.code === "auto" && (
                      <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-center transition-all duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}
