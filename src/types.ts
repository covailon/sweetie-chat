export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  affection: number;
  firstMessage?: string;
  creatorId?: string;
  createdAt?: number;
  tags?: string[];
}

export interface Message {
  id: string;
  characterId: string;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  stickerUrl?: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  notifications: boolean;
  sendOnEnter: boolean;
  language: 'vi' | 'en';
  allowNsfw: boolean;
}
