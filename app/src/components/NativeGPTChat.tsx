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
  const [isOpen, setIsOpen] = useState(true); // Always open by default
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
      console.log("Sending message to NativeGPT:", { messages: newMessages, transcriptionId, sessionId });
      
      const response = await fetch("/api/nativegpt/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          transcriptionId,
          sessionId,
        }),
      });

      console.log("NativeGPT response status:", response.status);
      console.log("NativeGPT response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error("NativeGPT API error:", errorData);
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      console.log("NativeGPT response data:", data);
      
      const assistantMsg: Message = { role: "assistant", content: data.reply };
      setMessages([...newMessages, assistantMsg]);
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF...");
      
      const response = await fetch("/api/export/pdf/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "NativeWrite Summary Sheet",
          transcriptText,
          chatMessages: messages,
        }),
      });

      toast.dismiss();

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NativeWrite_Summary_${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF downloaded successfully! 🧾");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSendToBookWriter = () => {
    // Find the latest AI response
    const latestAIResponse = messages
      .slice()
      .reverse()
      .find(m => m.role === "assistant")?.content;
    
    if (!latestAIResponse) {
      toast.error("No AI response found to send");
      return;
    }

    // Save to localStorage for Book Writer to pick up
    const existingDraft = localStorage.getItem("nativewrite_bookdraft") || "";
    const newDraft = existingDraft 
      ? `${existingDraft}\n\n---\n\n${latestAIResponse}` 
      : latestAIResponse;
    
    localStorage.setItem("nativewrite_bookdraft", newDraft);
    toast.success("Sent to Book Writer! ✍️");

    // Open Book Writer in new tab
    window.open("/dashboard/bookwriter", "_blank");
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
      {/* Floating Button - Always Visible */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white px-8 py-4 rounded-full shadow-2xl backdrop-blur-md border-2 border-white/30 font-medium z-50 hover:shadow-[0_0_30px_rgba(30,58,138,0.6)] transition-all duration-300 animate-pulse"
      >
        <span className="flex items-center gap-3">
          <span className="text-3xl">🧠</span>
          <span className="font-bold text-lg">NativeGPT</span>
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
            className="fixed bottom-0 right-0 w-full max-w-[500px] h-[750px] bg-white/20 backdrop-blur-3xl border-2 border-white/40 shadow-[0_0_60px_rgba(30,58,138,0.5)] rounded-tl-3xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-[#1E3A8A]/50 to-[#00B4D8]/50 border-b border-white/20">
              <div>
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                  🧠 NativeGPT Assistant
                </h3>
                <p className="text-sm text-white/80">Powered by OpenAI GPT-4o-mini</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors text-2xl hover:bg-white/20 rounded-full p-1"
              >
                ✖
              </button>
            </div>

            {/* Smart Commands */}
            {transcriptText && messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 border-b border-white/20 bg-white/10 smartbar"
              >
                <p className="text-sm text-white/80 mb-3 font-semibold">⚡ Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {smartCommands.map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => handleSmartCommand(cmd.prompt)}
                      disabled={loading}
                      className="text-sm px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/20 backdrop-blur-sm transition-all duration-200 active:scale-95 disabled:opacity-50 hover:shadow-lg"
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/5">
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
            <div className="p-6 border-t border-white/20 bg-white/10 space-y-4">
              {/* Action Buttons */}
              {messages.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <button
                    onClick={handleExportPDF}
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-lg border border-white/10 text-white transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(30,58,138,0.3)]"
                  >
                    🧾 Export PDF
                  </button>
                  <button
                    onClick={handleSendToBookWriter}
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm rounded-lg text-white transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(0,180,216,0.4)]"
                  >
                    ✍️ Send to Book Writer
                  </button>
                </motion.div>
              )}

              {/* Input Box */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask NativeGPT anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  disabled={loading}
                  className="flex-1 bg-[#0F1115] border-2 border-gray-700 rounded-xl px-5 py-4 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-400 focus:ring-0 transition-all disabled:opacity-50 backdrop-blur-sm text-base font-medium"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-[0_0_25px_rgba(30,58,138,0.5)]"
                >
                  <span className="text-xl font-bold">➤</span>
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

