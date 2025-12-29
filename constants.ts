
import { Objective, Profile, Gender, Mood } from './types';

export const APP_ID = 'velum-v1';

export const TRAVEL_CITIES = [
  'João Pessoa', 'Campina Grande', 'Patos', 'Sousa', 
  'Recife', 'Natal', 'Pipa', 'Maceió', 'Fortaleza', 'Salvador', 'Fernando de Noronha'
];

export const MOCK_INTERESTS = ['Arte Contemporânea', 'Tecnologia/AI', 'Psicologia', 'Negócios', 'Viagens de Luxo', 'Filosofia', 'Moda', 'Design', 'Política'];

export const OPTIONS = {
  genders: Object.values(Gender),
  appearance: ['Minimalista', 'Alternativo', 'Clássico', 'Dark', 'Executivo', 'Casual Chic'],
  traits: ['Tatuagens', 'Piercings', 'Barba', 'Cabelos Coloridos', 'Olhar Marcante', 'Sorriso Enigmático'],
  dressStyle: ['Noite/Gala', 'Streetwear de Luxo', 'Couro/BDSM', 'Casual', 'Alfaiataria'],
  drinks: ['Vinho Tinto', 'Whiskey Single Malt', 'Gin tônica', 'Coquetel Autoral', 'Champagne', 'Saquê'],
  cuisines: ['Japonesa', 'Contemporânea', 'Mediterrânea', 'Carnes', 'Vegana/Plant-based', 'Italiana'],
  environments: ['Rooftops', 'Speakeasies', 'Clubes Privados', 'Lounges de Hotel', 'Festas Underground'],
  music: ['Deep House', 'Techno', 'Jazz/Blues', 'Rock Alternativo', 'Indie', 'MPB', 'Eletrônica', 'Forró Noir', 'Axé Retro'],
  sports: ['Musculação', 'Crossfit', 'Tênis', 'Beach Tennis', 'Natação', 'Yoga', 'Futebol', 'Pilates'],
  hardLimits: ['Desrespeito', 'Falta de Higiene', 'Pressão', 'Registro não autorizado', 'Nudez em público'],
  secrecy: ['Total/Anônimo', 'Discreto', 'Aberto/Social'],
  experience: ['Iniciante curioso', 'Experiente', 'Veterano', 'Apenas observando']
};

export const MOCK_USER: Profile = {
  uid: 'me',
  username: 'alex_noir',
  email: 'alex@noir.com',
  name: 'Alex',
  age: 28,
  gender: Gender.HOMEM,
  seeking: [Gender.MULHER, Gender.CASAL_MF],
  bio: 'Explorador do estilo de vida liberal e apreciador de design.',
  objectives: [Objective.MENAGE, Objective.CASUAL_HOJE],
  mood: Mood.ENCONTRO,
  isPrivate: true,
  photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'],
  location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' },
  vaultPhotos: [],
  interests: ['Arte Contemporânea'],
  appearance: 'Minimalista'
};

export const MOCK_PROFILES: Profile[] = [
  {
    uid: '1',
    username: 'julia_ricardo',
    email: 'julia@example.com',
    name: 'Júlia & Ricardo',
    age: 32,
    gender: Gender.CASAL_MF,
    seeking: [Gender.HOMEM, Gender.MULHER],
    bio: 'Casal liberal em busca de novas experiências e conexões reais.',
    objectives: [Objective.TROCA_DE_CASAL, Objective.MENAGE],
    mood: Mood.ENCONTRO,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1516051662687-567d7c4e8f6a?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1250, lng: -34.8500, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' },
    vaultPhotos: [],
    interests: ['Negócios'],
    experienceLevel: 'Veterano'
  },
  {
    uid: '2',
    username: 'marina_lib',
    email: 'marina@example.com',
    name: 'Marina',
    age: 25,
    gender: Gender.MULHER,
    seeking: [Gender.HOMEM, Gender.CASAL_MF],
    bio: 'Arquiteta apaixonada por arte e boas conversas noturnas.',
    objectives: [Objective.CASUAL_HOJE],
    mood: Mood.CONVERSA,
    isPrivate: false,
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -8.0476, lng: -34.8770, city: 'Recife', state: 'Pernambuco', type: 'MANUAL' },
    vaultPhotos: [],
    interests: ['Psicologia'],
    music: 'Jazz'
  },
  {
    uid: '3',
    username: 'paulo_vibe',
    email: 'paulo@example.com',
    name: 'Paulo',
    age: 30,
    gender: Gender.HOMEM,
    seeking: [Gender.MULHER, Gender.CASAL_MF],
    bio: 'Empresário discreto buscando fugir da rotina.',
    objectives: [Objective.SOLO],
    mood: Mood.FESTA,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -5.7945, lng: -35.2110, city: 'Natal', state: 'Rio Grande do Norte', type: 'GPS' },
    vaultPhotos: [],
    interests: ['Negócios']
  },
  {
    uid: '4',
    username: 'carla_fabio',
    email: 'carla@example.com',
    name: 'Carla & Fábio',
    age: 29,
    gender: Gender.CASAL_MF,
    seeking: [Gender.HOMEM],
    bio: 'Casal novo no meio, curiosos e educados.',
    objectives: [Objective.MENAGE],
    mood: Mood.DISCRETO,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'PB', type: 'MANUAL' },
    vaultPhotos: [],
    interests: ['Viagens']
  },
  {
    uid: '5',
    username: 'thais_trans',
    email: 'thais@example.com',
    name: 'Thaís',
    age: 26,
    gender: Gender.TRANS_NB,
    seeking: [Gender.HOMEM, Gender.MULHER, Gender.CASAL_MF],
    bio: 'Livre de rótulos, em busca de prazer e conexão.',
    objectives: [Objective.CURIOSO],
    mood: Mood.FESTA,
    isPrivate: false,
    photos: ['https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'PB', type: 'GPS' },
    vaultPhotos: [],
    interests: ['Moda']
  },
  {
    uid: '6',
    username: 'rodrigo_solo',
    email: 'rodrigo@example.com',
    name: 'Rodrigo',
    age: 34,
    gender: Gender.HOMEM,
    seeking: [Gender.MULHER],
    bio: 'Single discreto e atlético.',
    objectives: [Objective.SOLO],
    mood: Mood.CONVERSA,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'PB', type: 'GPS' },
    vaultPhotos: [],
    interests: ['Esportes']
  },
  {
    uid: '7',
    username: 'bia_fernanda',
    email: 'bia@example.com',
    name: 'Bia & Fernanda',
    age: 27,
    gender: Gender.CASAL_FF,
    seeking: [Gender.HOMEM, Gender.MULHER],
    bio: 'Duas amigas explorando juntas o mundo liberal.',
    objectives: [Objective.TROCA_DE_CASAL, Objective.MENAGE],
    mood: Mood.FESTA,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'PB', type: 'GPS' },
    vaultPhotos: [],
    interests: ['Música']
  },
  {
    uid: '8',
    username: 'lucas_sp',
    email: 'lucas@example.com',
    name: 'Lucas',
    age: 28,
    gender: Gender.HOMEM,
    seeking: [Gender.HOMEM, Gender.TRANS_NB],
    bio: 'Em busca de novas aventuras masculinas.',
    objectives: [Objective.CASUAL_HOJE],
    mood: Mood.FESTA,
    isPrivate: false,
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -23.5505, lng: -46.6333, city: 'São Paulo', state: 'SP', type: 'MANUAL' },
    vaultPhotos: [],
    interests: ['Tecnologia']
  },
  {
    uid: '9',
    username: 'monica_couple',
    email: 'monica@example.com',
    name: 'Mônica & Leo',
    age: 38,
    gender: Gender.CASAL_MF,
    seeking: [Gender.MULHER],
    bio: 'Casal maduro procurando por uma terceira para momentos especiais.',
    objectives: [Objective.MENAGE],
    mood: Mood.DISCRETO,
    isPrivate: true,
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'PB', type: 'GPS' },
    vaultPhotos: [],
    interests: ['Vinhos']
  }
];
