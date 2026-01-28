
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Send, ArrowLeft, Sparkles, Trash2, Check
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Mood } from '../types';

// Added initialMood to props interface to fix type mismatch error in App.tsx
interface WritePageProps {
  onBack: () => void;
  initialMood?: Mood;
}

const WritePage: React.FC<WritePageProps> = ({ onBack, initialMood }) => {
  const [content, setContent] = useState(() => localStorage.getItem('after2am_draft_content') || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('after2am_draft_content', content);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  // Fix: incorporated initialMood into the AI prompt to provide context-aware suggestions
  const generatePrompt = useCallback(async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const moodContext = initialMood ? ` with a ${initialMood.toLowerCase()} mood` : "";
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Give me a single, poetic, slightly unsettling one-sentence writing prompt for a story written at 2 AM${moodContext}. Do not include quotes or labels. Just the sentence.`,
      });
      setPrompt(response.text?.trim() || '');
    } catch (err) {
      setPrompt("What is the sound that silence makes when it's tired?");
    } finally {
      setIsAiLoading(false);
    }
  }, [isAiLoading, initialMood]);

  const clearDraft = () => {
    if (window.confirm("Delete this draft?")) {
      setContent('');
      localStorage.removeItem('after2am_draft_content');
    }
  };

  const handleRelease = () => {
    alert("Whisper released into the void.");
    localStorage.removeItem('after2am_draft_content');
    onBack();
  };

  const wordCount = content.trim() ? content.split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-8 pb-32 px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        
        <header className="flex items-center justify-between py-4 border-b border-slate-900">
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-300 transition-colors flex items-center space-x-2 text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>Cancel</span>
          </button>
          <div className="flex items-center space-x-4">
            {isSaved && <span className="text-[10px] text-slate-700 uppercase tracking-widest flex items-center"><Check size={10} className="mr-1"/> Saved</span>}
            <button 
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
              onClick={generatePrompt}
              className="text-[10px] uppercase tracking-[0.3em] text-slate-600 hover:text-indigo-400 flex items-center space-x-2 transition-colors"
            >
              <Sparkles size={14} />
              <span>{isAiLoading ? 'Gathering...' : 'Get a Prompt'}</span>
            </button>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="text-slate-500 italic font-serif text-lg mb-2">"{prompt}"</p>
              <button onClick={() => setPrompt('')} className="text-[9px] uppercase tracking-widest text-slate-800 hover:text-slate-600">Dismiss</button>
            </div>
          )}
        </div>

        <div className="pt-4">
          <textarea 
            ref={textareaRef}
            placeholder="Start writing your midnight thoughts..."
            className="w-full min-h-[60vh] bg-transparent border-none text-2xl font-serif text-slate-400 placeholder:text-slate-900 focus:outline-none focus:ring-0 resize-none leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        </div>

        <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-center pointer-events-none">
          <div className="max-w-3xl w-full flex items-center justify-between bg-slate-950/80 backdrop-blur-md border border-slate-900 p-2 rounded-2xl pointer-events-auto">
            <span className="px-6 text-[10px] uppercase tracking-widest text-slate-700 font-mono">
              {wordCount} words
            </span>
            <button 
              onClick={handleRelease}
              disabled={!content.trim()}
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
};

export default WritePage;
