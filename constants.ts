
import { Objective, Profile, Gender, Mood } from './types';

export const APP_ID = 'velum-v1';

export const TRAVEL_CITIES = [
  'João Pessoa', 'Campina Grande', 'Patos', 'Recife', 'Natal', 'Pipa', 'Maceió', 'Fortaleza', 'Salvador'
];

export const OPTIONS = {
  genders: Object.values(Gender),
  appearance: ['Minimalista', 'Alternativo', 'Clássico', 'Dark', 'Executivo', 'Casual Chic'],
  traits: ['Tatuagens', 'Piercings', 'Barba', 'Cabelos Coloridos', 'Olhar Marcante', 'Sorriso Enigmático'],
  drinks: ['Vinho Tinto', 'Whiskey Single Malt', 'Gin tônica', 'Coquetel Autoral', 'Champagne', 'Saquê'],
  music: ['Deep House', 'Techno', 'Jazz/Blues', 'Rock Alternativo', 'Indie', 'MPB', 'Eletrônica'],
  vibes: ['Sofisticado', 'Underground', 'Relaxado', 'Intenso', 'Misterioso', 'Enérgico'],
  sports: ['Academia', 'Crossfit', 'Surfe', 'Yoga', 'Tênis', 'Lutas', 'Corrida', 'Natação'],
  hardLimits: ['Desrespeito', 'Falta de Higiene', 'Pressão', 'Registro não autorizado']
};

export const MOCK_USER: Profile = {
  uid: 'me',
  username: 'alex_noir',
  // Added missing phone property
  phone: '83999999999',
  email: 'alex@noir.com',
  name: 'Alex',
  age: 28,
  gender: Gender.HOMEM,
  seeking: [Gender.MULHER, Gender.CASAL_MF],
  bio: 'Explorador do estilo de vida liberal.',
  objectives: [Objective.MENAGE],
  mood: Mood.ENCONTRO,
  isPrivate: true,
  photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'],
  location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' },
  vaultPhotos: [],
  interests: ['Academia'],
  appearance: 'Minimalista',
  music: 'Deep House',
  environment: 'Sofisticado'
};

export const MOCK_PROFILES: Profile[] = [
  {
    uid: '1',
    username: 'julia_jp',
    // Added missing phone property
    phone: '83988888881',
    email: 'julia@example.com',
    name: 'Júlia',
    age: 32,
    gender: Gender.MULHER,
    seeking: [Gender.HOMEM],
    bio: 'Discreta e decidida. Amo vinhos e conversas profundas.',
    objectives: [Objective.CASUAL_HOJE],
    mood: Mood.ENCONTRO,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'PB', type: 'GPS' },
    vaultPhotos: [],
    interests: []
  },
  {
    uid: '2',
    username: 'pablo_pipa',
    // Added missing phone property
    phone: '84977777772',
    email: 'pablo@pipa.com',
    name: 'Pablo',
    age: 27,
    gender: Gender.HOMEM,
    seeking: [Gender.MULHER],
    bio: 'Aproveitando o melhor de Pipa. Surf, sol e novas conexões.',
    objectives: [Objective.SOLO],
    mood: Mood.FESTA,
    isPrivate: false,
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -6.2306, lng: -35.0486, city: 'Pipa', state: 'RN', type: 'MANUAL' },
    vaultPhotos: [],
    interests: []
  },
  {
    uid: '3',
    username: 'couple_natal',
    // Added missing phone property
    phone: '84966666663',
    email: 'couple@natal.com',
    name: 'Bia & Leo',
    age: 35,
    gender: Gender.CASAL_MF,
    seeking: [Gender.MULHER, Gender.CASAL_MF],
    bio: 'Casal liberal em Natal procurando companhia para jantares e diversão.',
    objectives: [Objective.TROCA_DE_CASAL],
    mood: Mood.DISCRETO,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1516051662687-567d7c4e8f6a?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -5.7945, lng: -35.2110, city: 'Natal', state: 'RN', type: 'MANUAL' },
    vaultPhotos: [],
    interests: []
  },
  {
    uid: '4',
    username: 'recife_noir',
    // Added missing phone property
    phone: '81955555554',
    email: 'recife@noir.com',
    name: 'Clara',
    age: 29,
    gender: Gender.MULHER,
    seeking: [Gender.HOMEM, Gender.MULHER],
    bio: 'Artes e prazer em Recife. Minimalista e direta.',
    objectives: [Objective.MENAGE],
    mood: Mood.CONVERSA,
    isPrivate: false,
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -8.0476, lng: -34.8770, city: 'Recife', state: 'PE', type: 'MANUAL' },
    vaultPhotos: [],
    interests: []
  },
  {
    uid: '5',
    username: 'cg_guy',
    // Added missing phone property
    phone: '83944444445',
    email: 'cg@guy.com',
    name: 'Ricardo',
    age: 31,
    gender: Gender.HOMEM,
    seeking: [Gender.MULHER],
    bio: 'Executivo em Campina. Procuro discrição e bons momentos.',
    objectives: [Objective.CASUAL_HOJE],
    mood: Mood.DISCRETO,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.2245, lng: -35.8761, city: 'Campina Grande', state: 'PB', type: 'MANUAL' },
    vaultPhotos: [],
    interests: []
  }
];
