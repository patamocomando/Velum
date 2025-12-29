
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

export enum Mood {
  CONVERSA = 'Apenas Conversa',
  ENCONTRO = 'Encontro Hoje',
  FESTA = 'Mood Festa',
  DISCRETO = 'Mood Discreto'
}

export enum AppState {
  LANDING = 'LANDING',
  SIGNUP = 'SIGNUP',
  ONBOARDING = 'ONBOARDING',
  TUTORIAL = 'TUTORIAL',
  DISCOVER = 'DISCOVER',
  CHAT_LIST = 'CHAT_LIST',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
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
  username: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  seeking: Gender[]; // Novo campo para filtros
  bio: string;
  objectives: Objective[];
  mood: Mood;
  isPrivate: boolean;
  photos: string[];
  vaultPhotos: string[];
  location: UserLocation;
  interests: string[];
  
  appearance?: string;
  traits?: string;
  height?: string;
  dressStyle?: string;
  drink?: string;
  cuisine?: string;
  environment?: string;
  smoking?: string;
  experienceLevel?: string;
  opennessScale?: number;
  kinks?: string;
  music?: string;
  subjects?: string;
  introExtroScale?: number;
  hardLimits?: string;
  secrecyLevel?: string;
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
  veilOpened: boolean;
}
