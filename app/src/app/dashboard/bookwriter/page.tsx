"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

interface Chapter {
  id: string;
  title: string;
  summary?: string;
  content: string;
}

export default function BookWriterPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // Load chapters from localStorage on mount
  useEffect(() => {
    const savedChapters = localStorage.getItem("nativewrite_chapters");
    const savedDraft = localStorage.getItem("nativewrite_bookdraft");
    
    if (savedChapters) {
      try {
        setChapters(JSON.parse(savedChapters));
      } catch (error) {
        console.error("Error loading chapters:", error);
      }
    }
    
    // If there's a draft from NativeGPT, add it as a new chapter
    if (savedDraft && !savedChapters) {
      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        title: "Imported from NativeGPT",
        content: savedDraft,
      };
      setChapters([newChapter]);
      setSelectedChapterId(newChapter.id);
      localStorage.removeItem("nativewrite_bookdraft"); // Clear after import
    }
  }, []);

  // Save chapters to localStorage whenever they change
  useEffect(() => {
    if (chapters.length > 0) {
      localStorage.setItem("nativewrite_chapters", JSON.stringify(chapters));
    }
  }, [chapters]);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${chapters.length + 1}`,
      content: "",
    };
    setChapters([...chapters, newChapter]);
    setSelectedChapterId(newChapter.id);
    toast.success("New chapter added!");
  };

  const deleteChapter = (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    
    setChapters(chapters.filter(c => c.id !== id));
    if (selectedChapterId === id) {
      setSelectedChapterId(null);
    }
    toast.success("Chapter deleted");
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters(chapters.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleGenerateOutline = async () => {
    if (!ideaPrompt.trim()) {
      toast.error("Please enter a book idea first");
      return;
    }

    setIsGeneratingOutline(true);
    toast.loading("Generating AI outline...");

    try {
      const response = await fetch("/api/book/outliner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idea: ideaPrompt,
          chapterCount: 10
        }),
      });

      toast.dismiss();

      if (!response.ok) {
        throw new Error("Failed to generate outline");
      }

      const data = await response.json();

      if (data.chapters && Array.isArray(data.chapters)) {
        const newChapters: Chapter[] = data.chapters.map((ch: { title: string; summary: string }) => ({
          id: crypto.randomUUID(),
          title: ch.title,
          summary: ch.summary,
          content: "",
        }));
        
        setChapters(newChapters);
        setSelectedChapterId(newChapters[0]?.id || null);
        toast.success(`AI generated ${newChapters.length} chapters! 🎉`);
      } else {
        toast.error("Failed to parse outline");
      }
    } catch (error) {
      console.error("Outline generation error:", error);
      toast.error("Failed to generate outline");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const currentChapter = chapters.find(c => c.id === selectedChapterId);

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === chapters.length - 1) return;

    const newChapters = [...chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newChapters[index], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[index]];
    setChapters(newChapters);
    toast.success("Chapter reordered");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f9fafb] to-[#e5e7eb]">
      {/* Sidebar - Chapter Manager */}
      <div className="w-80 bg-white/40 backdrop-blur-xl border-r border-white/20 p-4 flex flex-col shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span>📚</span>
            <span>Book Writer</span>
          </h2>
          <p className="text-sm text-slate-600">AI-powered chapter management</p>
        </div>

        {/* AI Outliner */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">⚡ AI Book Outliner</h3>
          <textarea
            placeholder="Enter your book idea or theme..."
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            className="w-full h-20 p-2 text-sm rounded-lg bg-white/80 outline-none border border-slate-200 focus:border-blue-400 transition-all resize-none"
          />
          <button
            onClick={handleGenerateOutline}
            disabled={isGeneratingOutline}
            className="mt-2 w-full bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg py-2 hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 text-sm font-medium"
          >
            {isGeneratingOutline ? "Generating..." : "🧠 Generate Outline"}
          </button>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedChapterId === chapter.id
                    ? "bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white shadow-lg scale-105"
                    : "bg-white/60 hover:bg-white/80 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{chapter.title}</div>
                    {chapter.summary && (
                      <div className="text-xs opacity-80 mt-1 truncate">{chapter.summary}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(index, 'up');
                      }}
                      disabled={index === 0}
                      className="text-xs opacity-60 hover:opacity-100 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(index, 'down');
                      }}
                      disabled={index === chapters.length - 1}
                      className="text-xs opacity-60 hover:opacity-100 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Chapter Button */}
        <button
          onClick={addChapter}
          className="mt-4 w-full bg-white/60 hover:bg-white/80 text-slate-800 rounded-lg py-3 transition-all duration-200 border border-slate-300 font-medium shadow-sm hover:shadow-md"
        >
          ➕ Add Chapter
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 p-8">
        {currentChapter ? (
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {/* Chapter Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <input
                  value={currentChapter.title}
                  onChange={(e) => updateChapter(currentChapter.id, { title: e.target.value })}
                  className="text-3xl font-bold bg-transparent border-b-2 border-slate-300 focus:border-[#1E3A8A] outline-none transition-all w-full text-slate-900"
                  placeholder="Chapter Title"
                />
                {currentChapter.summary && (
                  <p className="text-sm text-slate-600 mt-2 italic">{currentChapter.summary}</p>
                )}
              </div>
              <button
                onClick={() => deleteChapter(currentChapter.id)}
                className="ml-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-all duration-200"
              >
                🗑️ Delete
              </button>
            </div>

            {/* Chapter Content Editor */}
            <div className="flex-1 mb-6">
              <textarea
                value={currentChapter.content}
                onChange={(e) => updateChapter(currentChapter.id, { content: e.target.value })}
                className="w-full h-full p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all resize-none text-slate-900 leading-relaxed"
                placeholder="Start writing your chapter here...

You can paste content from NativeGPT or write directly. The content auto-saves as you type."
              />
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm text-slate-600">
              <div>
                <span className="font-medium">Words:</span> {currentChapter.content.split(/\s+/).filter(w => w).length}
              </div>
              <div>
                <span className="font-medium">Characters:</span> {currentChapter.content.length}
              </div>
              <div>
                <span className="font-medium">Reading time:</span> {Math.ceil(currentChapter.content.split(/\s+/).filter(w => w).length / 200)} min
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">✍️</div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">No Chapter Selected</h2>
              <p className="text-slate-600 mb-6">
                Generate an AI outline or add a chapter to begin writing
              </p>
              <button
                onClick={addChapter}
                className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#00B4D8] text-white rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
              >
                ➕ Create First Chapter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        theme="light"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(30, 58, 138, 0.2)',
          },
        }}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
