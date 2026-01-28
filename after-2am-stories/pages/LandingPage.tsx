
import React from 'react';
import { Mood } from '../types';
import { MOOD_CONFIG } from '../constants';
import { PenSquare } from 'lucide-react';

interface LandingPageProps {
  onMoodSelect: (mood: Mood) => void;
  onWrite: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onMoodSelect, onWrite }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-6 text-center animate-fade-in">
      <div className="space-y-16 w-full">
        <div className="space-y-4">
          <h1 className="text-slate-400 font-serif italic text-3xl md:text-4xl tracking-tight">It’s late.</h1>
          <p className="text-slate-600 text-xs font-medium uppercase tracking-[0.2em]">How do you feel right now?</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {MOOD_CONFIG.map((m) => (
            <button
              key={m.id}
              onClick={() => onMoodSelect(m.id)}
              className="group relative w-full py-5 text-[11px] tracking-[0.2em] uppercase text-slate-500 bg-slate-900/10 border border-slate-900 rounded-xl hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/30 transition-all duration-300 active:scale-[0.98]"
            >
              <span className="relative z-10">{m.phrase}</span>
            </button>
          ))}
        </div>

        <div className="pt-4">
          <button 
            onClick={onWrite}
            className="group flex items-center justify-center space-x-3 mx-auto px-6 py-3 rounded-full border border-slate-900 hover:border-indigo-500/30 transition-all duration-500"
          >
            <PenSquare size={14} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-slate-700 group-hover:text-slate-300 transition-colors">
              Whisper a story
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
