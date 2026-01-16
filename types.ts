
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  plan?: string[]; // Optional actionable plan
}

export interface UserProfile {
  name: string;
  token: string;
  isRegistered: boolean;
}

export interface SageState {
  isThinking: boolean;
  isListening: boolean;
  lastResponse?: string;
}
