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
  const [isExpandingChapter, setIsExpandingChapter] = useState(false);

  // Load chapters from localStorage on mount
  useEffect(() => {
    const savedChapters = localStorage.getItem("nativewrite_chapters");
    const savedDraft = localStorage.getItem("nativewrite_bookdraft");
    
    if (savedChapters) {
      try {
        const parsed = JSON.parse(savedChapters);
        setChapters(parsed);
        if (parsed.length > 0) {
          setSelectedChapterId(parsed[0].id);
        }
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
      localStorage.removeItem("nativewrite_bookdraft");
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
    toast.success("New chapter added");
  };

  const deleteChapter = (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    
    setChapters(chapters.filter(c => c.id !== id));
    if (selectedChapterId === id) {
      setSelectedChapterId(chapters.find(c => c.id !== id)?.id || null);
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
    const loadingToast = toast.loading("Generating outline...");

    try {
      const response = await fetch("/api/book/outliner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idea: ideaPrompt,
          chapterCount: 10
        }),
      });

      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate outline");
      }

      const data = await response.json();

      if (data.chapters && Array.isArray(data.chapters) && data.chapters.length > 0) {
        const newChapters: Chapter[] = data.chapters.map((ch: { title: string; summary: string }) => ({
          id: crypto.randomUUID(),
          title: ch.title || "Untitled Chapter",
          summary: ch.summary || "",
          content: "",
        }));
        
        setChapters(newChapters);
        setSelectedChapterId(newChapters[0]?.id || null);
        toast.success(`Generated ${newChapters.length} chapters`);
      } else {
        toast.error("Invalid response format");
      }
    } catch (error) {
      console.error("Outline generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate outline";
      toast.error(message);
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

  const handleExpandChapter = async (chapter: Chapter) => {
    if (!chapter) return;

    setIsExpandingChapter(true);
    const loadingToast = toast.loading("Expanding chapter...");

    try {
      const response = await fetch("/api/book/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterTitle: chapter.title,
          chapterSummary: chapter.summary || "",
          currentText: chapter.content,
        }),
      });

      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to expand chapter");
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        const separator = chapter.content ? "\n\n" : "";
        updateChapter(chapter.id, { 
          content: chapter.content + separator + data.text.trim()
        });
        toast.success(`Added ${data.wordCount || 0} words`);
      } else {
        toast.error("No content generated");
      }
    } catch (error) {
      console.error("Chapter expansion error:", error);
      const message = error instanceof Error ? error.message : "Failed to expand chapter";
      toast.error(message);
    } finally {
      setIsExpandingChapter(false);
    }
  };

  const handleOpenChapterChat = (chapter: Chapter) => {
    if (!chapter) return;
    
    localStorage.setItem("nativewrite_gptcontext", JSON.stringify({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterSummary: chapter.summary || "",
      chapterContent: chapter.content,
    }));
    
    toast.info("Opening chapter chat...");
    window.open(`/nativegpt?chapter=${encodeURIComponent(chapter.title)}`, "_blank");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Book Writer</h2>
          <p className="text-sm text-slate-600">AI-powered chapter management</p>
        </div>

        {/* AI Outliner */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Book Outliner
          </h3>
          <textarea
            placeholder="Enter your book idea or theme..."
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            className="w-full h-24 p-3 text-sm rounded-lg bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            disabled={isGeneratingOutline}
          />
          <button
            onClick={handleGenerateOutline}
            disabled={isGeneratingOutline || !ideaPrompt.trim()}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
          >
            {isGeneratingOutline ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Outline
              </>
            )}
          </button>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <AnimatePresence mode="popLayout">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedChapterId === chapter.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{chapter.title}</div>
                    {chapter.summary && (
                      <div className={`text-xs mt-1 truncate ${
                        selectedChapterId === chapter.id ? "text-blue-100" : "text-slate-600"
                      }`}>
                        {chapter.summary}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(index, 'up');
                      }}
                      disabled={index === 0}
                      className={`text-xs p-0.5 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed ${
                        selectedChapterId === chapter.id ? "text-white" : "text-slate-500"
                      }`}
                      title="Move up"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(index, 'down');
                      }}
                      disabled={index === chapters.length - 1}
                      className={`text-xs p-0.5 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed ${
                        selectedChapterId === chapter.id ? "text-white" : "text-slate-500"
                      }`}
                      title="Move down"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
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
          className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg py-3 px-4 transition-colors border border-slate-300 font-medium text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Chapter
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {currentChapter ? (
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col p-8"
          >
            {/* Chapter Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <input
                    value={currentChapter.title}
                    onChange={(e) => updateChapter(currentChapter.id, { title: e.target.value })}
                    className="text-3xl font-bold bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none transition-colors w-full text-slate-900 pb-2"
                    placeholder="Chapter Title"
                  />
                  {currentChapter.summary && (
                    <p className="text-sm text-slate-600 mt-3 italic">{currentChapter.summary}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteChapter(currentChapter.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            {/* Chapter Content Editor */}
            <div className="flex-1 mb-6">
              <textarea
                value={currentChapter.content}
                onChange={(e) => updateChapter(currentChapter.id, { content: e.target.value })}
                className="w-full h-full p-6 bg-white rounded-lg shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-900 leading-relaxed"
                placeholder="Start writing your chapter here...

You can paste content from NativeGPT or write directly. The content auto-saves as you type."
              />
            </div>

            {/* AI Tools */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleExpandChapter(currentChapter)}
                disabled={isExpandingChapter}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
              >
                {isExpandingChapter ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Expanding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Expand Chapter with AI
                  </>
                )}
              </button>
              <button
                onClick={() => handleOpenChapterChat(currentChapter)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-lg border border-slate-300 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Open Chapter Chat
              </button>
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
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Chapter Selected</h2>
              <p className="text-slate-600 mb-6">
                Generate an AI outline or add a chapter to begin writing
              </p>
              <button
                onClick={addChapter}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Chapter
              </button>
            </div>
          </div>
        )}
      </div>

      <Toaster 
        position="top-right"
        theme="light"
      />
    </div>
  );
}
