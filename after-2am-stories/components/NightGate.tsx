
import React, { useState, useEffect } from 'react';

interface NightGateProps {
  children: React.ReactNode;
}

const NightGate: React.FC<NightGateProps> = ({ children }) => {
  const [passed, setPassed] = useState<boolean>(() => {
    return localStorage.getItem('after2am_gate_passed') === 'true';
  });

  const isLate = () => {
    const hour = new Date().getHours();
    return hour >= 0 && hour < 5; // 12am to 5am
  };

  const handleEnter = () => {
    setPassed(true);
    localStorage.setItem('after2am_gate_passed', 'true');
  };

  if (passed || isLate()) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-xs space-y-6">
        <p className="text-slate-400 font-serif italic text-lg leading-relaxed">
          “This feels better after midnight.”
        </p>
        <p className="text-slate-600 text-xs uppercase tracking-widest">
          But you can stay.
        </p>
        <button 
          onClick={handleEnter}
          className="mt-8 px-6 py-2 text-xs border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all rounded-full"
        >
          Let me in anyway
        </button>
      </div>
    </div>
  );
};

export default NightGate;
