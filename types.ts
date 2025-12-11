
export type Category = 'ALL' | 'AI' | 'DESIGN' | 'FRONTEND' | 'MEDIA' | 'TOOLS' | 'GAME';

export interface NavLink {
  id: string;
  title: string;
  url: string;
  color: string;
  icon?: string;
  category: Category;
}

export enum PetMood {
  IDLE = 'IDLE',
  HAPPY = 'HAPPY',
  SLEEP = 'SLEEP',
  SURPRISED = 'SURPRISED',
  ANGRY = 'ANGRY',
  LOVE = 'LOVE'
}

export interface PetState {
  mood: PetMood;
  hunger: number; // 0-100
  energy: number; // 0-100
}

export type PetSkinId = 'girl-white' | 'girl-pink' | 'cat-orange';

export interface PetSkin {
  id: PetSkinId;
  name: string;
  avatarColor: string; // CSS color for the preview circle
  description: string;
}

export type GameId = 'snake' | 'tictactoe' | 'tetris3d';

export interface BuiltInGame {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  color: string;
}
