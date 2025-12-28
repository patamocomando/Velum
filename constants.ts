
import { Objective, Profile, Gender } from './types';

export const APP_ID = 'velum-v1';

export const STATES_CITIES = {
  'Paraíba': ['João Pessoa', 'Campina Grande', 'Cabedelo', 'Patos'],
  'Pernambuco': ['Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Caruaru'],
  'Rio Grande do Norte': ['Natal', 'Mossoró', 'Parnamirim', 'Caicó']
};

export const MOCK_USER: Profile = {
  uid: 'me',
  email: 'alex@noir.com',
  name: 'Alex',
  age: 28,
  gender: Gender.HOMEM,
  bio: 'Explorando o novo com respeito e curiosidade.',
  objectives: [Objective.MENAGE, Objective.CASUAL_HOJE],
  isPrivate: true,
  photos: ['https://picsum.photos/seed/me/600/800'],
  location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' },
  vaultPhotos: ['https://picsum.photos/seed/v1/600/800', 'https://picsum.photos/seed/v2/600/800'],
  tags: ['Vinho & Conversa', 'Fetiches']
};

export const MOCK_PROFILES: Profile[] = [
  {
    uid: '1',
    email: 'julia@example.com',
    name: 'Júlia & Ricardo',
    age: 32,
    gender: Gender.CASAL_MF,
    bio: 'Casal liberal em busca de novas experiências em João Pessoa. Prezamos por discrição e educação.',
    objectives: [Objective.TROCA_DE_CASAL, Objective.MENAGE],
    isPrivate: true,
    photos: ['https://picsum.photos/seed/p1/600/800', 'https://picsum.photos/seed/p1-2/600/800'],
    location: { lat: -7.1250, lng: -34.8500, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' },
    vaultPhotos: [],
    tags: ['Vinho & Conversa', 'Festas Privadas']
  },
  {
    uid: '2',
    email: 'marina@example.com',
    name: 'Marina',
    age: 25,
    gender: Gender.MULHER,
    bio: 'Curiosa e decidida. Vamos conversar e ver no que dá?',
    objectives: [Objective.CASUAL_HOJE, Objective.CURIOSO],
    isPrivate: false,
    photos: ['https://picsum.photos/seed/p2/600/800'],
    location: { lat: -8.0476, lng: -34.8770, city: 'Recife', state: 'Pernambuco', type: 'MANUAL' },
    vaultPhotos: [],
    tags: ['Café & Chill', 'Respeito Total']
  },
  {
    uid: '3',
    email: 'paulo@example.com',
    name: 'Paulo',
    age: 30,
    gender: Gender.HOMEM,
    bio: 'Single man em busca de casais ou solos para amizade colorida.',
    objectives: [Objective.SOLO, Objective.MENAGE],
    isPrivate: true,
    photos: ['https://picsum.photos/seed/p3/600/800'],
    location: { lat: -5.7945, lng: -35.2110, city: 'Natal', state: 'Rio Grande do Norte', type: 'GPS' },
    vaultPhotos: [],
    tags: ['Fetiches', 'Experiências VIP']
  }
];
