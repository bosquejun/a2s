
import React, { useState, useCallback } from 'react';
import NightGate from './components/NightGate';
import AmbientSound from './components/AmbientSound';
import LandingPage from './pages/LandingPage';
import StoryReader from './pages/StoryReader';
import WritePage from './pages/WritePage';
import { STORIES, MOOD_CONFIG } from './constants';
import { Mood, Story } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'story' | 'write'>('landing');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMoodSelect = useCallback((mood: Mood) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setSelectedMood(mood);
      const filtered = mood === 'Eerie' 
        ? STORIES 
        : STORIES.filter(s => s.mood === mood || s.mood === 'Confessional');
      
      const random = filtered[Math.floor(Math.random() * filtered.length)] || STORIES[0];
      setCurrentStory(random);
      setView('story');
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedMood) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const nextOptions = selectedMood === 'Eerie' 
        ? STORIES 
        : STORIES.filter(s => s.mood === selectedMood || s.mood === 'Confessional');
      
      let next = nextOptions[Math.floor(Math.random() * nextOptions.length)];
      if (nextOptions.length > 1 && next.id === currentStory?.id) {
         next = nextOptions.find(s => s.id !== currentStory?.id) || next;
      }
      
      setCurrentStory(next);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [selectedMood, currentStory]);

  const goHome = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMood(null);
      setCurrentStory(null);
      setView('landing');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, []);

  const goToWrite = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView('write');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, []);

  const activeMoodConfig = MOOD_CONFIG.find(m => m.id === selectedMood);

  return (
    <NightGate>
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
        {view === 'landing' && (
          <header className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 z-40 pointer-events-none">
            <button 
              onClick={goHome}
              className="font-serif italic text-xl opacity-40 hover:opacity-100 transition-opacity pointer-events-auto"
              aria-label="Go to landing"
            >
              after 2am
            </button>
            
            <div className="flex flex-col items-end">
              {activeMoodConfig && (
                <button 
                  onClick={goHome}
                  className="group flex flex-col items-end pointer-events-auto animate-fade-in"
                  aria-label="Change mood"
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 group-hover:text-slate-400 transition-colors">
                    {activeMoodConfig.phrase}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-slate-800 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                    Change
                  </span>
                </button>
              )}
            </div>
          </header>
        )}

        <main className={`flex-grow flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {view === 'landing' && (
            <LandingPage onMoodSelect={handleMoodSelect} onWrite={goToWrite} />
          )}
          {view === 'story' && currentStory && (
            <StoryReader story={currentStory} onNext={handleNext} onHome={goHome} onWrite={goToWrite} />
          )}
          {view === 'write' && (
            <WritePage onBack={goHome} initialMood={selectedMood || undefined} />
          )}
        </main>

        {view === 'landing' && <AmbientSound />}

        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </NightGate>
  );
};

export default App;
