
import { Story, Mood, Category, MoodMetadata } from './types';

export const MOOD_CONFIG: MoodMetadata[] = [
  { id: 'Haunting', label: 'Haunting', phrase: 'I want something dark' },
  { id: 'Emotional', label: 'Emotional', phrase: 'I miss someone' },
  { id: 'Confessional', label: 'Confessional', phrase: 'I can’t sleep' },
  { id: 'Thoughtful', label: 'Thoughtful', phrase: 'I feel empty' },
  { id: 'Eerie', label: 'Eerie', phrase: 'Surprise me' }
];

export const CATEGORIES: Category[] = ['Fiction', 'Reality', 'Poetry', 'Journal', 'Urban Legend'];

export const MOCK_STORIES: Story[] = [
  {
    id: '1',
    mood: 'Confessional',
    category: 'Journal',
    title: 'The Hum of the Fan',
    excerpt: "The fan in my room sounds like a conversation I'm not invited to.",
    content: "The fan in my room sounds like a conversation I'm not invited to. I keep trying to decipher the syllables in the hum, but every time I get close, the wind shifts. It's 3:14 AM and I'm still trying to remember why I was angry three years ago...",
    author: "anon_9",
    timestamp: "3:14 AM",
    readTime: "4 min read",
    tags: ["insomnia", "midnight", "regret"],
    likes: 12,
    commentsCount: 3
  },
  {
    id: '2',
    mood: 'Emotional',
    category: 'Reality',
    title: 'Wrong Details',
    excerpt: "I saw a car exactly like yours today. For half a second, the world made sense again.",
    content: "I saw a car exactly like yours today. For half a second, the world made sense again. Then I noticed the bumper sticker. You would have hated that sticker...",
    author: "ghost_heart",
    timestamp: "1:45 AM",
    readTime: "5 min read",
    tags: ["loss", "memory", "cars"],
    likes: 24,
    commentsCount: 8
  },
  {
    id: '3',
    mood: 'Eerie',
    category: 'Urban Legend',
    title: 'The Neighbor\'s Garden',
    excerpt: "My neighbor has been digging in his garden for four nights straight.",
    content: "My neighbor has been digging in his garden for four nights straight. No lights, just the sound of a shovel hitting wet dirt...",
    author: "watcher",
    timestamp: "2:10 AM",
    readTime: "6 min read",
    tags: ["neighbors", "horror", "night"],
    likes: 45,
    commentsCount: 15
  }
];

export const STORIES = MOCK_STORIES;
