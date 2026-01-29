"use client";

import { EditorProvider, type Editor, type JSONContent } from "@/components/kibo-ui/editor";
import type { Mood } from "@/lib/types";
import { EditorContent, useCurrentEditor } from "@tiptap/react";
import {
  ArrowLeft,
  Check,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface WritePageProps {
  initialMood?: Mood;
}

function EditorWrapper() {
  const { editor } = useCurrentEditor();
  if (!editor) return null;
  return <EditorContent editor={editor} />;
}

export function WritePage({ initialMood }: WritePageProps) {
  const [content, setContent] = useState<JSONContent | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("after2am_draft_content");
    if (saved) {
      try {
        setContent(JSON.parse(saved));
      } catch {
        // If JSON parse fails, treat as plain text
        const text = window.localStorage.getItem("after2am_draft_content_text") || saved;
        setContent({
          type: "doc",
          content: text
            ? [
                {
                  type: "paragraph",
                  content: text.split("\n").map((line) => ({
                    type: "text",
                    text: line,
                  })),
                },
              ]
            : [],
        });
      }
    } else {
      setContent({
        type: "doc",
        content: [],
      });
    }
  }, []);

  const generatePrompt = useCallback(async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/after2am-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood: initialMood ?? null }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prompt");
      }

      const data: { prompt: string } = await response.json();
      setPrompt(data.prompt.trim());
    } catch {
      setPrompt(
        "What is the sound that silence makes when it's tired?",
      );
    } finally {
      setIsAiLoading(false);
    }
  }, [initialMood, isAiLoading]);

  const handleUpdate = ({ editor }: { editor: Editor }) => {
    editorRef.current = editor;
    const json = editor.getJSON();
    const text = editor.getText();
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
    setContent(json);

    // Auto-save to localStorage
    if (typeof window !== "undefined") {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        window.localStorage.setItem("after2am_draft_content", JSON.stringify(json));
        window.localStorage.setItem("after2am_draft_content_text", text);
        setIsSaved(true);
        window.setTimeout(() => setIsSaved(false), 2000);
      }, 1000);
    }
  };

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm("Delete this draft?");
    if (!confirmed) return;
    window.localStorage.removeItem("after2am_draft_content");
    window.localStorage.removeItem("after2am_draft_content_text");
    setContent({
      type: "doc",
      content: [],
    });
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
    }
  };

  const handleRelease = async () => {
    if (typeof window !== "undefined" && editorRef.current) {
      const text = editorRef.current.getText();
      if (!text.trim()) return;

      const response = await fetch('/api/stories/write', {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish story");
      }

      const data = await response.json();
      console.log(data);
      
      setContent({
        type: "doc",
        content: [],
      });
      if (editorRef.current) {
        editorRef.current.commands.clearContent();
      }
    }
  };

  if (content === null) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-8 pb-32 px-6 animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-slate-500 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-8 pb-32 px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="flex items-center justify-between py-4 border-b border-slate-900">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-slate-500 hover:text-slate-300 transition-colors flex items-center space-x-2 text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>Cancel</span>
          </button>
          <div className="flex items-center space-x-4">
            {isSaved ? (
              <span className="text-[10px] text-slate-700 uppercase tracking-widest flex items-center">
                <Check size={10} className="mr-1" />
                Saved
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearDraft}
              className="text-slate-700 hover:text-rose-500 transition-colors"
              title="Delete Draft"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center space-y-4">
          {!prompt ? (
            <button
              type="button"
              onClick={generatePrompt}
              className="text-[10px] uppercase tracking-[0.3em] text-slate-600 hover:text-indigo-400 flex items-center space-x-2 transition-colors"
            >
              <Sparkles size={14} />
              <span>{isAiLoading ? "Gathering..." : "Get a Prompt"}</span>
            </button>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="text-slate-500 italic font-serif text-lg mb-2">
                &quot;{prompt}&quot;
              </p>
              <button
                type="button"
                onClick={() => setPrompt("")}
                className="text-[9px] uppercase tracking-widest text-slate-800 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <div className="pt-4">
          <EditorProvider
            className="w-full min-h-[60vh] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60vh] [&_.ProseMirror]:bg-transparent [&_.ProseMirror]:text-2xl [&_.ProseMirror]:font-serif [&_.ProseMirror]:text-slate-400 [&_.ProseMirror]:leading-relaxed prose prose-invert prose-p:text-slate-400 prose-p:text-2xl prose-p:font-serif prose-p:leading-relaxed max-w-none"
            content={content}
            onUpdate={handleUpdate}
            onCreate={({ editor }) => {
              editorRef.current = editor;
              editor.commands.focus();
              const text = editor.getText();
              const count = text.trim() ? text.trim().split(/\s+/).length : 0;
              setWordCount(count);
            }}
            placeholder="Start writing your midnight thoughts..."
          >
            <EditorWrapper />
          </EditorProvider>
        </div>

        <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-center pointer-events-none">
          <div className="max-w-3xl w-full flex items-center justify-between bg-slate-950/80 backdrop-blur-md border border-slate-900 p-2 rounded-2xl pointer-events-auto">
            <span className="px-6 text-[10px] uppercase tracking-widest text-slate-700 font-mono">
              {wordCount} words
            </span>
            <button
              type="button"
              onClick={handleRelease}
              disabled={wordCount === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-800 text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              <span>Publish Whisper</span>
              <Send size={14} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}


