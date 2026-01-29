import { Category, Mood } from "@/lib/database/generated/prisma/enums";

export interface MoodMetadata {
  id: Mood;
  phrase: string;
  label: string;
}

export interface After2AmStory {
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


