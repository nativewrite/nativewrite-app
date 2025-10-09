"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useSearchParams } from "next/navigation";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function NativeGPTPage() {
  const searchParams = useSearchParams();
  const chapterParam = searchParams.get("chapter");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are NativeGPT, a helpful AI writing assistant built into NativeWrite. You help users with transcription analysis, rewriting, translation, book writing, and content improvement. Be concise, friendly, and professional."
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chapterContext, setChapterContext] = useState<{
    chapterId?: string;
    chapterTitle?: string;
    chapterSummary?: string;
    chapterContent?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chapter context from localStorage if available
  useEffect(() => {
    const savedContext = localStorage.getItem("nativewrite_gptcontext");
    if (savedContext) {
      try {
        const context = JSON.parse(savedContext);
        setChapterContext(context);
        
        // Update system message with chapter context
        setMessages([
          {
            role: "system",
            content: `You are NativeGPT, helping the author work on a book chapter titled "${context.chapterTitle}".

${context.chapterSummary ? `Chapter Summary: ${context.chapterSummary}` : ''}

${context.chapterContent ? `Current Chapter Content:\n${context.chapterContent.slice(0, 1000)}${context.chapterContent.length > 1000 ? '...' : ''}` : 'The chapter is empty - help the author get started!'}

Your role is to help expand, improve, brainstorm, and polish this chapter. Be creative and helpful!`
          }
        ]);
        
        // Clear the context after loading
        localStorage.removeItem("nativewrite_gptcontext");
      } catch (error) {
        console.error("Error loading context:", error);
      }
    }
  }, []);

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
          transcriptionId: null,
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
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToBookWriter = () => {
    const latestAIResponse = messages
      .slice()
      .reverse()
      .find(m => m.role === "assistant")?.content;
    
    if (!latestAIResponse) {
      toast.error("No AI response found to send");
      return;
    }

    if (chapterContext?.chapterId) {
      // Update specific chapter
      const savedChapters = localStorage.getItem("nativewrite_chapters");
      if (savedChapters) {
        try {
          const chapters = JSON.parse(savedChapters);
          const updatedChapters = chapters.map((ch: { id: string; content: string }) =>
            ch.id === chapterContext.chapterId
              ? { ...ch, content: ch.content + "\n\n" + latestAIResponse }
              : ch
          );
          localStorage.setItem("nativewrite_chapters", JSON.stringify(updatedChapters));
          toast.success("Updated chapter in Book Writer! ✍️");
        } catch (error) {
          console.error("Error updating chapter:", error);
          toast.error("Failed to update chapter");
        }
      }
    } else {
      // Save as general draft
      const existingDraft = localStorage.getItem("nativewrite_bookdraft") || "";
      const newDraft = existingDraft 
        ? `${existingDraft}\n\n---\n\n${latestAIResponse}` 
        : latestAIResponse;
      
      localStorage.setItem("nativewrite_bookdraft", newDraft);
      toast.success("Sent to Book Writer! ✍️");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="max-w-5xl mx-auto p-8 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span>🧠</span>
                <span>NativeGPT</span>
              </h1>
              <p className="text-white/60">Your AI writing assistant</p>
              {chapterContext && (
                <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-sm text-blue-300">
                  📖 Context: {chapterContext.chapterTitle}
                </div>
              )}
            </div>
            <a
              href="/dashboard/bookwriter"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              ← Back to Book Writer
            </a>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.2)] flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
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
                    className={`max-w-[80%] p-4 rounded-2xl ${
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
                <div className="bg-white/15 px-5 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
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
          <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
            {/* Action Buttons */}
            {messages.length > 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <button
                  onClick={handleSendToBookWriter}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm rounded-lg text-white transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(0,180,216,0.4)] font-medium"
                >
                  ✍️ Send to Book Writer
                </button>
              </motion.div>
            )}

            {/* Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask NativeGPT about your chapter..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={loading}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/40 transition-all disabled:opacity-50 backdrop-blur-sm"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span className="text-lg">➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(30, 58, 138, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />

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
    </main>
  );
}

