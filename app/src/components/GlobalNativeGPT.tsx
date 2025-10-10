"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function GlobalNativeGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "system", 
      content: "You are NativeGPT, the AI assistant inside NativeWrite. You help users with transcription analysis, text rewriting, translation, book writing, and content improvement. Be concise, friendly, and professional." 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      console.log("Sending to NativeGPT:", userMessage);
      
      const res = await fetch("/api/chat/nativegpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages.slice(-10) // Keep last 10 messages for context
        }),
      });
      
      const data = await res.json();
      console.log("NativeGPT response:", data);
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error(data.error || "No response from NativeGPT");
      }
    } catch (error) {
      console.error("NativeGPT error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble responding right now. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white px-6 py-3 rounded-full shadow-xl font-medium transition-all duration-300 hover:shadow-2xl border border-blue-500/20"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span>Chat</span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-96 bg-[#0F1115]/95 backdrop-blur-xl text-gray-100 rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-blue-600/20 to-blue-400/20">
              <div>
                <h2 className="text-lg font-semibold text-white">NativeGPT</h2>
                <span className="text-xs text-gray-400">Powered by OpenAI</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div className="p-3 max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
              {messages
                .filter((m) => m.role !== "system")
                .map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-lg ${
                      m.role === "user"
                        ? "bg-blue-600/30 text-blue-100 ml-8 border border-blue-500/20"
                        : "bg-white/10 text-gray-100 mr-8 border border-gray-600/20"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </motion.div>
                ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-gray-400"
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span>NativeGPT is thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700 p-3 bg-[#0F1115]/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask NativeGPT anything..."
                  className="flex-1 bg-[#1A1C1F] text-gray-100 placeholder-gray-500 px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400 transition-colors"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  ➤
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
