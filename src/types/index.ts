// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
  favoriteTopics: string[];
  savedArticles: string[];
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  aiSummary?: string; // Optional - generated on-demand
  author: string;
  authorAvatar?: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  views: number;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface SavedArticle {
  userId: string;
  articleId: string;
  savedAt: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  ArticleDetail: { article: Article };
  Search: undefined;
  Profile: undefined;
  Settings: undefined;
  SavedArticles: undefined;
  AdminDashboard: undefined;
};
