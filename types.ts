
export enum Objective {
  MENAGE = 'Ménage',
  TROCA_DE_CASAL = 'Troca de Casal',
  CASUAL_HOJE = 'Casual / Hoje',
  CURIOSO = 'Curioso(a)',
  SOLO = 'Solo'
}

export enum Gender {
  HOMEM = 'Homem',
  MULHER = 'Mulher',
  CASAL_MF = 'Casal (M+F)',
  CASAL_MM = 'Casal (M+M)',
  CASAL_FF = 'Casal (F+F)',
  TRANS_NB = 'Trans / Não Binário'
}

export enum AppState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING = 'ONBOARDING',
  DISCOVER = 'DISCOVER',
  CHAT_LIST = 'CHAT_LIST',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  VAULT = 'VAULT'
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  type: 'GPS' | 'MANUAL';
}

export interface Profile {
  uid: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  objectives: Objective[];
  isPrivate: boolean; // Modo Sigilo (Blur)
  photos: string[]; // Suporta até 10 fotos
  location: UserLocation;
  vaultPhotos: string[];
  tags?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  partner: Profile;
  messages: Message[];
  ndaAccepted: boolean;
}
