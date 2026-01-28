
import React, { useState } from 'react';
import StoryCard from '../components/StoryCard';
import { MOCK_STORIES } from '../constants';
import { Mood, Category } from '../types';
import { Search, Filter, Layers, Zap } from 'lucide-react';

const MOODS: (Mood | 'All Moods')[] = ['All Moods', 'Haunting', 'Emotional', 'Confessional', 'Thoughtful', 'Eerie'];
const CATEGORIES: (Category | 'All Categories')[] = ['All Categories', 'Fiction', 'Reality', 'Poetry', 'Journal', 'Urban Legend'];

const FeedPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | 'All Moods'>('All Moods');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All Categories'>('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = MOCK_STORIES.filter(story => {
    const matchesMood = selectedMood === 'All Moods' || story.mood === selectedMood;
    const matchesCategory = selectedCategory === 'All Categories' || story.category === selectedCategory;
    const matchesSearch = 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMood && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-serif mb-4">Tonight's Stories</h2>
          <p className="text-slate-400 font-light">The latest whispers from the darkness, categorized by shadow and light.</p>
        </header>

        <div className="flex flex-col space-y-8">
          {/* Controls Container */}
          <div className="space-y-6 bg-slate-900/20 p-6 rounded-2xl border border-slate-800/50">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search titles, memories, or #tags..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <Layers className="w-3 h-3" />
                  <span>Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] transition-all duration-300 border ${
                        selectedCategory === cat 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <Zap className="w-3 h-3" />
                  <span>Mood</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] transition-all duration-300 border ${
                        selectedMood === mood 
                          ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feed Result Count */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-2">
            <span>Showing {filteredStories.length} reflections</span>
            {(selectedMood !== 'All Moods' || selectedCategory !== 'All Categories' || searchQuery) && (
              <button 
                onClick={() => {setSelectedMood('All Moods'); setSelectedCategory('All Categories'); setSearchQuery('');}}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 gap-8">
            {filteredStories.length > 0 ? (
              filteredStories.map((story, idx) => (
                <div key={story.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <StoryCard story={story} />
                </div>
              ))
            ) : (
              <div className="py-24 text-center border border-dashed border-slate-800 rounded-3xl">
                <div className="bg-slate-900/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-slate-500 italic">The silence remains unbroken. Try different filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
