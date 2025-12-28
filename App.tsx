
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Shield, Heart, MessageSquare, User, Lock, MapPin, ArrowRight, Camera, 
  Ghost, Send, Key, ChevronLeft, X, Check, Plus, Mail, Eye, EyeOff, 
  Sparkles, Wine, Music, Flame, Coffee, CameraOff, MessageCircle, Navigation, Download
} from 'lucide-react';
import { AppState, Objective, Gender, Profile, ChatSession, Message, UserLocation } from './types';
import { MOCK_USER, MOCK_PROFILES, STATES_CITIES, APP_ID } from './constants';
import { calculateDistance, generateId } from './utils';
import { Button, Input, Card, Badge, Header } from './components/UI';
import { GoogleGenAI } from "@google/genai";

// Fix: Using CDN imports for Firebase to resolve "Module 'firebase/app' has no exported member 'initializeApp'"
// and ensure compatibility in environments where standard imports might be incorrectly resolved.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, addDoc, query, orderBy, Timestamp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// Note: In a real Vercel production, use process.env.VITE_FIREBASE_CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyPlaceholder", // USUÁRIO DEVE CONFIGURAR NO FIREBASE CONSOLE
  authDomain: "velum-app.firebaseapp.com",
  projectId: "velum-app",
  storageBucket: "velum-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let db: any;
let auth: any;

try {
  // Only attempt if not already initialized
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase not initialized - check config or internet connection.", e);
}

const LIFESTYLE_TAGS = [
  { icon: <Wine size={14} />, label: 'Vinho & Conversa' },
  { icon: <Music size={14} />, label: 'Festas Privadas' },
  { icon: <Flame size={14} />, label: 'Fetiches' },
  { icon: <Coffee size={14} />, label: 'Café & Chill' },
  { icon: <Sparkles size={14} />, label: 'Experiências VIP' },
  { icon: <Shield size={14} />, label: 'Respeito Total' }
];

const App: React.FC = () => {
  // --- STATE ---
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Swipe Logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Discovery / Filters
  const [selectedCategory, setSelectedCategory] = useState<Objective | 'Geral'>('Geral');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [ndaModalOpen, setNdaModalOpen] = useState(false);

  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [tempProfile, setTempProfile] = useState<Partial<Profile>>({
    photos: [],
    objectives: [],
    tags: [],
    gender: undefined,
    isPrivate: true,
    bio: '',
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' }
  });

  // --- LÓGICA PWA ---
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // --- AI BIO GENERATION ---
  const handleGenerateBio = async () => {
    if (!tempProfile.name || !tempProfile.gender) {
      alert("Por favor, preencha seu apelido e escolha sua essência (Gênero) antes de gerar a bio.");
      return;
    }

    setIsGeneratingBio(true);
    try {
      // Use gemini-3-flash-preview for creative and fast text generation.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um redator de perfis exclusivos para uma sociedade noir secreta chamada VELUM.
        Crie uma biografia sedutora, misteriosa, poética e muito curta (máximo 150 caracteres).
        Dados do usuário:
        Apelido: ${tempProfile.name}
        Gênero: ${tempProfile.gender}
        Desejos: ${tempProfile.objectives?.join(', ') || 'Exploração e mistério'}
        Idioma: Português Brasileiro.
        Tom: Elegante e noir.`,
      });

      if (result.text) {
        setTempProfile(prev => ({ ...prev, bio: result.text.trim() }));
      }
    } catch (error) {
      console.error("Erro ao gerar bio com IA:", error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      try {
        if (user) {
          const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data() as Profile);
            setCurrentPage(AppState.DISCOVER);
          } else {
            setCurrentPage(AppState.SIGNUP);
          }
        }
      } catch (e) {
        console.error("Firebase auth check failed:", e);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveProfileToFirebase = async (profileData: Profile) => {
    if (!db || !auth?.currentUser) return;
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'users', auth.currentUser.uid, 'profile', 'data');
      await setDoc(docRef, profileData);
      
      const publicRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'profiles', auth.currentUser.uid);
      await setDoc(publicRef, profileData);
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      // Offline/Mock mode if Firebase is down
      setCurrentUser(MOCK_USER);
      setCurrentPage(AppState.DISCOVER);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed:", e);
      setCurrentUser(MOCK_USER);
      setCurrentPage(AppState.DISCOVER);
    }
  };

  // --- DERIVED STATE ---
  const filteredProfiles = useMemo(() => {
    let list = [...MOCK_PROFILES];
    if (selectedCategory !== 'Geral') {
      list = list.filter(p => p.objectives.includes(selectedCategory as Objective));
    }
    return list;
  }, [selectedCategory]);

  // --- HANDLERS ---
  const handleAction = (type: 'like' | 'dislike') => {
    const profile = filteredProfiles[currentIndex];
    if (!profile) return;

    if (type === 'like') {
      const newChat: ChatSession = {
        id: `chat_${generateId()}`,
        partner: profile,
        messages: [{ id: generateId(), senderId: profile.uid, text: 'O VÉU caiu. Vamos nos conhecer?', timestamp: Date.now() }],
        ndaAccepted: false
      };
      setChatHistory(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setNdaModalOpen(true);
    }
    
    setSwipeOffset(type === 'like' ? 400 : -400);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeOffset(0);
      setPhotoIndex(0);
    }, 250);
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const renderLanding = () => (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-8 overflow-hidden animate-in fade-in duration-1000">
      {/* Background Image - Nightclub mood */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541532746401-cc0904000301?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover brightness-[0.25]"
          alt="Night Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-[#070708]/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Shield Icon Circle */}
        <div className="w-24 h-24 bg-black/80 rounded-full flex items-center justify-center mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
          <Shield className="text-indigo-500" size={44} strokeWidth={1.2} />
        </div>

        {/* Text Logo */}
        <h1 className="text-7xl font-serif italic text-white tracking-tighter mb-1 select-none">VELUM</h1>
        <p className="text-gray-300 uppercase tracking-[0.6em] text-[10px] font-black mb-10 opacity-70">NOIR SOCIETY</p>
        
        {/* Phrase */}
        <p className="text-indigo-100/60 font-serif italic text-center text-lg mb-16 leading-relaxed">
          "Onde o sigilo é o nosso pacto e a liberdade o seu desejo."
        </p>

        {/* Action Buttons - Exactly as reference */}
        <div className="w-full space-y-4">
          <Button variant="secondary" fullWidth onClick={loginWithGoogle}>
            Começar Jornada
          </Button>
          <Button variant="outline" fullWidth onClick={() => setCurrentPage(AppState.SIGNUP)}>
            Entrar no Sigilo
          </Button>
          
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold py-2 hover:text-white transition-colors"
            >
              <Download size={14} /> Adicionar à tela inicial
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 z-10 text-center px-8 opacity-20">
        <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em] font-medium">
          PRIVACIDADE • CONSENTIMENTO • LIBERDADE
        </p>
      </div>
    </div>
  );

  const renderOnboarding = () => {
    const steps = [
      { id: 1, title: 'Identidade', desc: 'Quem é você?' },
      { id: 2, title: 'Essência', desc: 'Identidade Sexual' },
      { id: 3, title: 'Desejos', desc: 'O que busca?' },
      { id: 4, title: 'Visual', desc: 'Sua Galeria' },
      { id: 5, title: 'Privacidade', desc: 'O VÉU' }
    ];
    const step = steps.find(s => s.id === onboardingStep);

    return (
      <div className="min-h-screen bg-[#070708] flex flex-col p-8 pb-12 max-w-md mx-auto animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => onboardingStep > 1 ? setOnboardingStep(s => s - 1) : setCurrentPage(AppState.LANDING)} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5 flex-1 h-1">
            {steps.map(s => (
              <div key={s.id} className={`flex-1 rounded-full transition-all duration-700 ${s.id <= onboardingStep ? 'bg-indigo-600' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-indigo-500 font-black mb-2">{step?.title}</h2>
          <h3 className="text-4xl font-serif italic text-white mb-10">{step?.desc}</h3>

          {onboardingStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <Input placeholder="Seu apelido" value={tempProfile.name || ''} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} />
              <Input type="number" placeholder="Idade" value={tempProfile.age || ''} onChange={e => setTempProfile({...tempProfile, age: parseInt(e.target.value)})} />
              <div className="relative group">
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none h-32 pr-12 transition-all focus:bg-white/[0.08]" 
                  placeholder="Sua bio noir..." 
                  value={tempProfile.bio || ''} 
                  onChange={e => setTempProfile({...tempProfile, bio: e.target.value})} 
                />
                <button 
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio}
                  className="absolute right-4 bottom-4 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                  title="Gerar bio com IA"
                >
                  <Sparkles size={18} className={isGeneratingBio ? 'animate-pulse' : ''} />
                </button>
              </div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest text-center opacity-60">
                Toque na estrela para deixar que a IA trace seu perfil noir.
              </p>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="grid grid-cols-1 gap-2 animate-in fade-in">
              {Object.values(Gender).map(g => (
                <button key={g} onClick={() => setTempProfile({...tempProfile, gender: g})} className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all ${tempProfile.gender === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-gray-500'}`}>{g}</button>
              ))}
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="grid grid-cols-1 gap-2 animate-in fade-in">
              {Object.values(Objective).map(obj => {
                const isSelected = tempProfile.objectives?.includes(obj);
                return (
                  <button 
                    key={obj} 
                    onClick={() => {
                      const cur = tempProfile.objectives || [];
                      setTempProfile({...tempProfile, objectives: isSelected ? cur.filter(o => o !== obj) : [...cur, obj]});
                    }}
                    className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                  >{obj}</button>
                );
              })}
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <button key={i} onClick={() => {
                  const cur = tempProfile.photos || [];
                  setTempProfile({...tempProfile, photos: [...cur, `https://picsum.photos/seed/${generateId()}/600/800`]});
                }} className="aspect-[3/4] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  {tempProfile.photos?.[i] ? <img src={tempProfile.photos[i]} className="w-full h-full object-cover" /> : <Plus className="text-gray-700" />}
                </button>
              ))}
            </div>
          )}

          {onboardingStep === 5 && (
            <div className="space-y-10 animate-in fade-in">
              <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10">
                <img src={tempProfile.photos?.[0] || 'https://picsum.photos/seed/p/600/800'} className={`w-full h-full object-cover ${tempProfile.isPrivate ? 'blur-3xl grayscale' : ''}`} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="text-center p-6 bg-black/40 rounded-3xl border border-white/10">
                    {tempProfile.isPrivate ? <Ghost size={40} className="mx-auto mb-4 text-indigo-400" /> : <Eye size={40} className="mx-auto mb-4 text-indigo-400" />}
                    <h4 className="text-white font-serif italic text-xl">{tempProfile.isPrivate ? 'Modo Sigilo' : 'Modo Nítido'}</h4>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant={tempProfile.isPrivate ? 'primary' : 'outline'} fullWidth onClick={() => setTempProfile({...tempProfile, isPrivate: true})}>Sigilo</Button>
                <Button variant={!tempProfile.isPrivate ? 'primary' : 'outline'} fullWidth onClick={() => setTempProfile({...tempProfile, isPrivate: false})}>Nítido</Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button fullWidth onClick={() => {
            if (onboardingStep < 5) setOnboardingStep(s => s + 1);
            else {
              const profile = {...MOCK_USER, ...tempProfile, uid: auth?.currentUser?.uid || 'me'} as Profile;
              setCurrentUser(profile);
              saveProfileToFirebase(profile);
              setCurrentPage(AppState.DISCOVER);
            }
          }}>
            {onboardingStep === 5 ? 'Iniciar Jornada' : 'Próximo'}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    );
  };

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#070708]/95 backdrop-blur-3xl border-t border-white/5 py-4 px-10 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <button onClick={() => setCurrentPage(AppState.DISCOVER)} className={`p-3 transition-all ${currentPage === AppState.DISCOVER ? 'text-indigo-500 scale-110' : 'text-gray-600'}`}>
        <Heart size={24} fill={currentPage === AppState.DISCOVER ? 'currentColor' : 'none'} />
      </button>
      <button onClick={() => setCurrentPage(AppState.VAULT)} className={`p-3 transition-all ${currentPage === AppState.VAULT ? 'text-indigo-500 scale-110' : 'text-gray-600'}`}>
        <Key size={24} />
      </button>
      <button onClick={() => setCurrentPage(AppState.CHAT_LIST)} className={`p-3 transition-all ${currentPage === AppState.CHAT_LIST || currentPage === AppState.CHAT ? 'text-indigo-500 scale-110' : 'text-gray-600'}`}>
        <MessageCircle size={24} />
      </button>
      <button onClick={() => setCurrentPage(AppState.PROFILE)} className={`p-3 transition-all ${currentPage === AppState.PROFILE ? 'text-indigo-500 scale-110' : 'text-gray-600'}`}>
        <User size={24} />
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-[#070708] text-white min-h-screen relative font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {currentPage === AppState.LANDING && renderLanding()}
      {currentPage === AppState.SIGNUP && renderOnboarding()}
      
      {/* Discovery Page */}
      {currentPage === AppState.DISCOVER && (
        <div className="pb-32 animate-in fade-in">
          <Header title="VELUM" rightElement={<button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-indigo-500"><Lock size={20} /></button>} />
          <div className="px-8 space-y-8">
            {filteredProfiles.length > currentIndex ? (
              <Card className="aspect-[3/4] relative">
                <img src={filteredProfiles[currentIndex].photos[0]} className={`w-full h-full object-cover ${filteredProfiles[currentIndex].isPrivate ? 'blur-3xl grayscale' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-3xl font-serif italic mb-1">{filteredProfiles[currentIndex].name}, {filteredProfiles[currentIndex].age}</h3>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">{filteredProfiles[currentIndex].objectives.join(' • ')}</p>
                </div>
              </Card>
            ) : (
              <div className="text-center py-20 opacity-30 italic font-serif">Sem novos segredos...</div>
            )}
            <div className="flex justify-center gap-6">
              <button onClick={() => setCurrentIndex(c => c + 1)} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-red-500"><X size={32}/></button>
              <button onClick={() => handleAction('like')} className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30"><Heart size={36} fill="white"/></button>
            </div>
          </div>
          <BottomNav />
        </div>
      )}

      {/* Profile Page */}
      {currentPage === AppState.PROFILE && (
        <div className="pb-32 animate-in fade-in">
          <Header title="Perfil" />
          <div className="px-10 space-y-10">
            <div className="w-full aspect-square rounded-[3rem] overflow-hidden border-2 border-indigo-500/20">
              <img src={currentUser?.photos[0] || MOCK_USER.photos[0]} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-serif italic">{currentUser?.name || 'Noir User'}</h2>
              <p className="text-gray-500 leading-relaxed italic">"{currentUser?.bio || 'Vivendo sem amarras.'}"</p>
            </div>
            <Button variant="outline" fullWidth onClick={() => { auth?.signOut(); setCurrentUser(null); setCurrentPage(AppState.LANDING); }}>Desconectar</Button>
          </div>
          <BottomNav />
        </div>
      )}

      {/* NDA Modal */}
      {ndaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
          <Card className="relative p-10 text-center border-indigo-500/20 bg-black/40">
            <Shield className="mx-auto text-indigo-500 mb-6" size={48} />
            <h2 className="text-3xl font-serif italic mb-6">Pacto de Honra</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-10 italic">"No VELUM, as máscaras caem, mas os segredos permanecem. Juramos sigilo total sobre o que for visto e dito."</p>
            <Button fullWidth onClick={() => setNdaModalOpen(false)}>Eu Juro</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;
