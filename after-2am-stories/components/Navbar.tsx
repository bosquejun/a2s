
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, PenSquare, BookOpen, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <Moon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="font-serif text-lg tracking-tight">After 2AM</span>
        </Link>
        
        <div className="flex items-center space-x-8 text-sm font-medium">
          <Link 
            to="/feed" 
            className={`flex items-center space-x-1 transition-colors ${isActive('/feed') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Stories</span>
          </Link>
          <Link 
            to="/write" 
            className={`flex items-center space-x-1 transition-colors ${isActive('/write') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <PenSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Write</span>
          </Link>
          <button className="text-slate-400 hover:text-slate-200 transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
