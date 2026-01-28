
export type Mood = 'Haunting' | 'Emotional' | 'Confessional' | 'Thoughtful' | 'Eerie';
export type Category = 'Fiction' | 'Reality' | 'Poetry' | 'Journal' | 'Urban Legend';

export interface MoodMetadata {
  id: Mood;
  phrase: string;
  label: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: Category;
  mood: Mood;
  timestamp: string;
  readTime: string;
  tags: string[];
  likes: number;
  commentsCount: number;
}
