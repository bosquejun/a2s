
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Heart, MessageSquare, Tag, Bookmark } from 'lucide-react';
import { MOCK_STORIES } from '../constants';

const StoryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  const story = MOCK_STORIES.find(s => s.id === id);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <p className="text-slate-400">Story not found.</p>
        <Link to="/feed" className="text-indigo-400 mt-4 block underline decoration-indigo-400/30 underline-offset-4">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-40 relative">
      {/* Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-[2px] bg-slate-900 z-50">
        <div 
          className="h-full bg-indigo-500 transition-all duration-150" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6">
        <Link 
          to="/feed" 
          className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-300 transition-colors mb-12 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to the feed</span>
        </Link>

        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
              {story.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              {story.mood}
            </span>
            <span className="text-slate-800">|</span>
            <span className="flex items-center space-x-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Recorded at {story.timestamp}</span>
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
            {story.title}
          </h1>

          <div className="flex items-center justify-between pb-8 border-b border-slate-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-serif italic text-indigo-400 border border-slate-700/50">
                {story.author[0]}
              </div>
              <div>
                <p className="text-sm text-slate-200">{story.author}</p>
                <p className="text-xs text-slate-500 font-light italic">Anonymous Whisperer</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-full transition-all duration-300 ${liked ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-transparent'}`}
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 ${liked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2.5 rounded-full transition-all duration-300 ${bookmarked ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-transparent'}`}
              >
                <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2.5 rounded-full bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none mb-24">
          <div className="font-serif text-slate-300 leading-relaxed space-y-8 text-xl whitespace-pre-line font-light italic opacity-90 drop-shadow-sm">
            {story.content}
          </div>
        </article>

        {/* Tags Section */}
        {story.tags && story.tags.length > 0 && (
          <div className="mb-24 flex flex-wrap gap-3">
            {story.tags.map(tag => (
              <span key={tag} className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-xs text-slate-500 border border-slate-800/50 hover:text-slate-300 hover:border-slate-700 transition-colors cursor-pointer group">
                <Tag className="w-3 h-3 group-hover:scale-110 transition-transform" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Quiet footer */}
        <div className="pt-16 border-t border-slate-900 text-center">
          <p className="text-slate-700 italic text-sm mb-8 tracking-wide">The memory dissipates into the dark.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button className="flex items-center space-x-2 px-6 py-3 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Leave a quiet reaction</span>
            </button>
            <Link to="/feed" className="text-slate-500 hover:text-slate-300 text-sm transition-colors border-b border-transparent hover:border-slate-800">
              Read something else
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewPage;
