
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight, Tag, Heart, MessageSquare } from 'lucide-react';
import { Story, Mood } from '../types';

interface StoryCardProps {
  story: Story;
}

const moodColors: Record<Mood, string> = {
  'Haunting': 'border-purple-500/20 group-hover:border-purple-500/50 bg-purple-500/5',
  'Emotional': 'border-rose-500/20 group-hover:border-rose-500/50 bg-rose-500/5',
  'Confessional': 'border-indigo-500/20 group-hover:border-indigo-500/50 bg-indigo-500/5',
  'Thoughtful': 'border-emerald-500/20 group-hover:border-emerald-500/50 bg-emerald-500/5',
  'Eerie': 'border-amber-500/20 group-hover:border-amber-500/50 bg-amber-500/5'
};

const textMoodColors: Record<Mood, string> = {
  'Haunting': 'text-purple-400',
  'Emotional': 'text-rose-400',
  'Confessional': 'text-indigo-400',
  'Thoughtful': 'text-emerald-400',
  'Eerie': 'text-amber-400'
};

const tagMoodStyles: Record<Mood, string> = {
  'Haunting': 'hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300',
  'Emotional': 'hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300',
  'Confessional': 'hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300',
  'Thoughtful': 'hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300',
  'Eerie': 'hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300'
};

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <Link to={`/story/${story.id}`} className="block group">
      <div className={`relative overflow-hidden p-8 rounded-3xl border transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 ${moodColors[story.mood] || 'border-slate-800 bg-slate-900/40'}`}>
        
        {/* Background Accent Glow */}
        <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full ${textMoodColors[story.mood].replace('text-', 'bg-')}`} />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full bg-slate-950/50 text-[10px] font-bold uppercase tracking-widest border border-white/5 ${textMoodColors[story.mood]}`}>
                {story.category}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                {story.mood}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-500 text-[10px] uppercase tracking-tighter">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{story.timestamp}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-800" />
              <span>{story.readTime}</span>
            </div>
          </div>
          
          <h3 className="text-3xl font-serif mb-4 group-hover:text-white transition-colors leading-tight tracking-tight">
            {story.title}
          </h3>
          
          <p className="text-slate-400/80 line-clamp-3 leading-relaxed mb-8 font-light italic text-lg">
            "{story.excerpt}"
          </p>

          <div className="flex flex-wrap gap-2.5 mb-8">
            {story.tags && story.tags.map(tag => (
              <span 
                key={tag} 
                className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] font-medium text-slate-500 bg-slate-950/20 px-2.5 py-1.5 rounded-lg border border-slate-800/50 transition-all duration-300 ${tagMoodStyles[story.mood]}`}
              >
                <Tag className="w-2.5 h-2.5 opacity-50" />
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/40">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{story.author}</span>
                  <span className="text-[9px] text-slate-600 uppercase tracking-widest">Contributor</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-4 text-slate-500">
                <div className="flex items-center space-x-1.5 hover:text-rose-400 transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="text-xs">{story.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-1.5 hover:text-indigo-400 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs">{story.commentsCount || 0}</span>
                </div>
              </div>
            </div>

            <div className={`flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${textMoodColors[story.mood]} opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0`}>
              <span>Read Entry</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;
