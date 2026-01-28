
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('after2am_ambient_global') === 'true';
    if (saved) {
      // Logic for restoration if needed, but browsers block auto-play
    }
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) {
      // Using a more atmospheric soft rain/night loop
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2381/2381-preview.mp3'); 
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("User interaction required for audio."));
    }
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('after2am_ambient_global', String(newState));
  };

  return (
    <button 
      onClick={toggleSound}
      className={`fixed bottom-6 right-6 p-3 rounded-full transition-all duration-500 z-40 border ${
        isPlaying 
          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
          : 'bg-slate-900/50 text-slate-600 hover:text-slate-400 border-slate-800/50'
      }`}
      aria-label="Toggle Global Night Ambience"
    >
      {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
};

export default AmbientSound;
