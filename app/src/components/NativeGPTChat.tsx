"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface NativeGPTChatProps {
  transcriptText?: string;
  transcriptionId?: string;
}

export default function NativeGPTChat({ transcriptText, transcriptionId }: NativeGPTChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are NativeGPT, a helpful AI writing assistant built into NativeWrite. You help users with transcription analysis, rewriting, translation, and content improvement. Be concise, friendly, and professional."
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/nativegpt/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          transcriptionId,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMsg: Message = { role: "assistant", content: data.reply };
      setMessages([...newMessages, assistantMsg]);
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      // Remove the user message if failed
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartCommand = async (commandPrompt: string) => {
    if (loading) return;
    
    const fullPrompt = transcriptText
      ? `${commandPrompt}\n\nHere is the text:\n\n${transcriptText}`
      : commandPrompt;

    await sendMessage(fullPrompt);
  };

  const smartCommands = [
    { label: "🧩 Summarize", prompt: "Summarize this transcript clearly and concisely, highlighting the main points." },
    { label: "✍️ Rewrite", prompt: "Rewrite this text to sound more professional, natural, and engaging." },
    { label: "🌐 Translate", prompt: "Translate this into French (or ask me which language you prefer)." },
    { label: "🎭 Rephrase", prompt: "Rephrase this using varied sentence structures and vocabulary while maintaining the original meaning." },
    { label: "🔍 Analyze", prompt: "Analyze this text and provide insights about its structure, tone, and key themes." },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/20 font-medium z-50 glow-button"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span>Chat with NativeGPT</span>
        </span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-0 right-0 w-full max-w-[450px] h-[700px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_50px_rgba(30,58,138,0.3)] rounded-tl-3xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-[#1E3A8A]/30 to-[#00B4D8]/30 border-b border-white/10">
              <div>
                <h3 className="font-semibold text-white text-lg">NativeGPT Assistant</h3>
                <p className="text-xs text-white/60">Powered by OpenAI GPT-4o-mini</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors text-xl"
              >
                ✖
              </button>
            </div>

            {/* Smart Commands */}
            {transcriptText && messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 border-b border-white/10 bg-white/5 smartbar"
              >
                <p className="text-xs text-white/60 mb-2 font-medium">Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {smartCommands.map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => handleSmartCommand(cmd.prompt)}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 backdrop-blur-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages
                .filter((m) => m.role !== "system")
                .map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-blue-500/40 to-cyan-500/40 text-white ml-auto border border-blue-400/30"
                          : "bg-white/15 text-white/95 mr-auto border border-white/10"
                      } backdrop-blur-sm shadow-lg`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </motion.div>
                ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/15 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask NativeGPT anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  disabled={loading}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/40 transition-all disabled:opacity-50 backdrop-blur-sm"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span className="text-lg">➤</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .glow-button {
          animation: glassGlow 3s ease-in-out infinite;
        }
        
        @keyframes glassGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(30, 58, 138, 0.4), 0 0 40px rgba(0, 180, 216, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(30, 58, 138, 0.6), 0 0 60px rgba(0, 180, 216, 0.4);
          }
        }
        
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .smartbar {
          animation: fadeSlideUp 0.5s ease forwards;
        }
        
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
    </>
  );
}

