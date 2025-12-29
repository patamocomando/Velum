
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Heart, User, Lock, MapPin, ArrowRight, Ghost, Send, Key, 
  X, Check, Plus, MessageCircle, Globe, LogOut, Zap, Users, Search,
  Eye, EyeOff, Sparkles, Info, Mail, Phone
} from 'lucide-react';
import { AppState, Objective, Gender, Profile, ChatSession } from './types';
import { MOCK_USER, MOCK_PROFILES, STATES_CITIES, APP_ID } from './constants';
import { calculateDistance, generateId } from './utils';
import { Button, Input, Card, Badge, Header } from './components/UI';
import { GoogleGenAI } from "@google/genai";

// Firebase imports (Simulado para comportamento customizado)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyPlaceholder", 
  authDomain: "velum-app.firebaseapp.com",
  projectId: "velum-app",
  storageBucket: "velum-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let db: any;
let auth: any;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase em modo de simulação.");
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Auth State
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loginUsername, setLoginUsername] = useState(''); // Usado no cadastro
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Discovery State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [likesList, setLikesList] = useState<Profile[]>(MOCK_PROFILES.slice(1, 3));
  const [viewingLikeProfile, setViewingLikeProfile] = useState<Profile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Objective | 'Geral'>('Geral');
  const [isTravelMode, setIsTravelMode] = useState(false);
  const [travelCity, setTravelCity] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [ndaModalOpen, setNdaModalOpen] = useState(false);

  useEffect(() => {
    const savedRemember = localStorage.getItem('velum_remember') === 'true';
    const savedProfile = localStorage.getItem('velum_profile');
    
    setRememberMe(savedRemember);

    if (savedRemember && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setCurrentUser(profile);
        setCurrentPage(AppState.DISCOVER);
      } catch (e) {
        console.error("Erro ao carregar sessão:", e);
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleAuth = async () => {
    if (isSignupMode) {
      if (!loginUsername || !loginPhone || !loginPassword) {
        alert("Por favor, preencha todos os campos para criar sua conta.");
        return;
      }
    } else {
      if (!loginPhone || !loginPassword) {
        alert("Por favor, preencha Telefone e Senha.");
        return;
      }
    }

    // Simulação de autenticação/cadastro
    const profile: Profile = {
      ...MOCK_USER,
      name: isSignupMode ? loginUsername : (loginUsername || 'Membro Noir'),
      uid: generateId(),
    };

    setCurrentUser(profile);
    
    if (isSignupMode) {
      setCurrentPage(AppState.SIGNUP); // Vai para o Pacto de Sigilo
    } else {
      setCurrentPage(AppState.DISCOVER);
    }

    if (rememberMe) {
      localStorage.setItem('velum_remember', 'true');
      localStorage.setItem('velum_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('velum_remember');
      localStorage.removeItem('velum_profile');
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('velum_remember');
    localStorage.removeItem('velum_profile');
    setCurrentPage(AppState.LANDING);
    setIsSignupMode(false);
    setLoginUsername('');
    setLoginPhone('');
    setLoginPassword('');
  };

  const filteredProfiles = useMemo(() => {
    let list = [...MOCK_PROFILES];
    if (selectedCategory !== 'Geral') {
      list = list.filter(p => p.objectives.includes(selectedCategory as Objective));
    }
    if (isTravelMode && travelCity) {
      list = list.filter(p => p.location.city === travelCity);
    }
    return list;
  }, [selectedCategory, isTravelMode, travelCity]);

  const handleAction = (type: 'like' | 'dislike', profileOverride?: Profile) => {
    const profile = profileOverride || filteredProfiles[currentIndex];
    if (!profile) return;
    
    if (type === 'like') {
      const hasLikedUs = likesList.find(l => l.uid === profile.uid);
      if (hasLikedUs) {
        setLikesList(prev => prev.filter(l => l.uid !== profile.uid));
        const newChat: ChatSession = {
          id: generateId(),
          partner: profile,
          messages: [{ id: generateId(), senderId: profile.uid, text: 'O VÉU caiu. O que você deseja revelar hoje?', timestamp: Date.now() }],
          ndaAccepted: false
        };
        setChatHistory(prev => [newChat, ...prev]);
        setActiveChat(newChat);
        setNdaModalOpen(true);
        setCurrentPage(AppState.CHAT);
      } else {
        if (!profileOverride) setCurrentIndex(prev => prev + 1);
      }
    } else {
      if (!profileOverride) setCurrentIndex(prev => prev + 1);
    }
    
    if (!profileOverride) setPhotoIndex(0);
    setViewingLikeProfile(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#070708] flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <h2 className="text-white font-serif italic text-xl animate-pulse tracking-widest">VELUM</h2>
        </div>
      </div>
    );
  }

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#070708]/95 backdrop-blur-3xl border-t border-white/5 pt-4 pb-10 px-10 flex justify-between items-center z-[100] rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
      <button onClick={() => setCurrentPage(AppState.DISCOVER)} className={`p-2 transition-all duration-300 ${currentPage === AppState.DISCOVER ? 'text-indigo-500 scale-125' : 'text-gray-600 hover:text-gray-400'}`}>
        <Heart size={28} fill={currentPage === AppState.DISCOVER ? 'currentColor' : 'none'} />
      </button>
      <button onClick={() => setCurrentPage(AppState.VAULT)} className={`p-2 transition-all duration-300 ${currentPage === AppState.VAULT ? 'text-indigo-500 scale-125' : 'text-gray-600 hover:text-gray-400'}`}>
        <Key size={28} /> 
      </button>
      <button onClick={() => setCurrentPage(AppState.CHAT_LIST)} className={`p-2 transition-all duration-300 ${currentPage === AppState.CHAT_LIST || currentPage === AppState.CHAT ? 'text-indigo-500 scale-125' : 'text-gray-600 hover:text-gray-400'}`}>
        <div className="relative">
          <MessageCircle size={28} />
          {(chatHistory.length > 0 || likesList.length > 0) && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#070708]" />}
        </div>
      </button>
      <button onClick={() => setCurrentPage(AppState.PROFILE)} className={`p-2 transition-all duration-300 ${currentPage === AppState.PROFILE ? 'text-indigo-500 scale-125' : 'text-gray-600 hover:text-gray-400'}`}>
        <User size={28} />
      </button>
    </div>
  );

  const renderLanding = () => (
    <div className="fixed inset-0 flex flex-col justify-center items-center px-8 bg-[#070708] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover brightness-[0.25] scale-110"
          alt="Luxury Noir Lounge"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/60 to-transparent" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm text-center animate-in fade-in zoom-in duration-700">
        {/* Ícone removido para um visual mais moderno e limpo conforme solicitado */}
        <div className="mb-10">
          <h1 className="text-7xl font-serif italic text-white tracking-tighter mb-1 select-none drop-shadow-2xl">VELUM</h1>
          <p className="text-gray-500 uppercase tracking-[0.6em] text-[10px] font-black opacity-80">NOIR SOCIETY</p>
        </div>
        
        <div className="w-full space-y-4 px-2 mb-6">
          {isSignupMode && (
            <div className="relative animate-in slide-in-from-top-2 duration-300">
              <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input 
                placeholder="Seu Nome ou Codinome" 
                className="pl-14 h-16 rounded-2xl bg-black/40 backdrop-blur-md border-white/5" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
          )}
          <div className="relative">
            <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Número de Telefone" 
              type="tel"
              className="pl-14 h-16 rounded-2xl bg-black/40 backdrop-blur-md border-white/5" 
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Senha de Acesso" 
              type={showPassword ? "text" : "password"}
              className="pl-14 h-16 rounded-2xl bg-black/40 backdrop-blur-md border-white/5 pr-14" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="w-full space-y-6 px-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-indigo-600 border-indigo-500' : 'border-white/20 bg-white/5'}`}>
                {rememberMe && <Check size={12} className="text-white" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-gray-300 font-bold transition-colors">Lembrar-me</span>
            </div>
            <button 
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 font-black transition-colors"
            >
              {isSignupMode ? "Já tenho conta" : "Criar nova conta"}
            </button>
          </div>

          <Button variant="secondary" fullWidth onClick={handleAuth} className="h-16 text-lg font-serif italic shadow-[0_15px_30px_rgba(255,255,255,0.05)]">
            {isSignupMode ? "Iniciar Jornada" : "Entrar no Pacto"}
          </Button>
          
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black opacity-60 mt-4">Sessão protegida por criptografia de ponta</p>
        </div>
      </div>
    </div>
  );

  const renderDiscovery = () => (
    <div className="fixed inset-0 flex flex-col bg-[#070708] max-w-md mx-auto overflow-hidden animate-in fade-in h-full">
      <div className="shrink-0">
        <div className="flex items-center justify-between px-6 pt-10 pb-4">
          <div className="flex flex-col">
            <h1 className="font-serif italic text-3xl tracking-tight text-white select-none">VELUM</h1>
            <div className="flex items-center gap-1.5 opacity-60">
              <MapPin size={10} className="text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100">
                {currentUser?.location.city || 'Próximo a você'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsTravelMode(!isTravelMode)} className={`w-12 h-12 flex items-center justify-center border rounded-2xl transition-all ${isTravelMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
              <Globe size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 mb-4 overflow-x-auto no-scrollbar flex gap-2">
          {['Geral', ...Object.values(Objective)].map(cat => (
            <button 
              key={cat} 
              onClick={() => { setSelectedCategory(cat as Objective | 'Geral'); setCurrentIndex(0); }} 
              className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border shrink-0 ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 mb-32 relative flex flex-col overflow-hidden">
        {filteredProfiles.length > currentIndex ? (
          <div className="w-full h-full relative flex flex-col animate-in zoom-in duration-500">
            <div className="flex-1 w-full relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] border border-white/5 bg-[#0d0d0f]">
              <img 
                src={filteredProfiles[currentIndex].photos[photoIndex]} 
                className={`w-full h-full object-cover transition-all duration-700 ${filteredProfiles[currentIndex].isPrivate ? 'blur-[70px] grayscale brightness-[0.4] scale-110' : ''}`} 
                alt="Profile Noir"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/20" />
              <div className="absolute top-5 left-8 right-8 flex gap-1.5 z-20">
                {filteredProfiles[currentIndex].photos.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === photoIndex ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/15'}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex z-10">
                <div className="flex-1" onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))} />
                <div className="flex-1" onClick={() => setPhotoIndex(Math.min(filteredProfiles[currentIndex].photos.length - 1, photoIndex + 1))} />
              </div>
              <div className="absolute bottom-10 left-8 right-8 pointer-events-none z-20">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-4xl font-serif italic text-white drop-shadow-2xl">{filteredProfiles[currentIndex].name}, {filteredProfiles[currentIndex].age}</h3>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {filteredProfiles[currentIndex].objectives.map(o => (
                    <span key={o} className="px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-10 mt-6 shrink-0 pb-2">
              <button onClick={() => handleAction('dislike')} className="w-16 h-16 bg-[#0d0d0f] border border-white/10 rounded-full flex items-center justify-center text-red-500 active:scale-90 shadow-2xl transition-all hover:bg-red-500/5">
                <X size={32}/>
              </button>
              <button onClick={() => handleAction('like')} className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_20px_40px_rgba(79,70,229,0.5)] active:scale-90 transition-all hover:bg-indigo-500 shadow-xl">
                <Heart size={36} fill="white"/>
              </button>
              <button className="w-16 h-16 bg-[#0d0d0f] border border-white/10 rounded-full flex items-center justify-center text-indigo-400 active:scale-90 shadow-2xl transition-all hover:bg-indigo-500/5">
                <Zap size={28}/>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-40 italic font-serif text-center px-10 h-full">
            <Ghost size={80} className="mb-8 text-indigo-500/40" />
            <h3 className="text-3xl text-white mb-2">Sua Frequência Terminou</h3>
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-600 leading-relaxed mb-12">
              O VÉU cobriu todos os segredos por agora.
            </p>
            <Button variant="outline" className="h-16 px-12" onClick={() => { setCurrentIndex(0); setIsTravelMode(false); setSelectedCategory('Geral'); }}>
              Revelar Novamente
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-[#070708] text-white min-h-screen relative font-sans overflow-hidden selection:bg-indigo-500/30">
      {currentPage === AppState.LANDING && renderLanding()}
      {currentPage === AppState.DISCOVER && renderDiscovery()}
      
      {currentPage === AppState.SIGNUP && (
        <div className="fixed inset-0 bg-[#070708] flex flex-col p-10 z-[200] animate-in slide-in-from-bottom duration-500">
          <Header title="Cadastro" onBack={() => setCurrentPage(AppState.LANDING)} />
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 px-4">
             <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <Shield size={64} className="text-indigo-500 animate-pulse" />
             </div>
             <div className="space-y-4">
               <h3 className="text-4xl font-serif italic text-white">Bem-vindo, {currentUser?.name}</h3>
               <p className="text-gray-400 text-sm leading-relaxed italic font-serif">
                 "Ao entrar na VELUM Noir Society, você jura silêncio absoluto sobre o que é visto e sussurrado aqui."
               </p>
             </div>
             <Button fullWidth onClick={() => { setCurrentPage(AppState.DISCOVER); }}>
               Aceitar Pacto e Entrar
             </Button>
          </div>
        </div>
      )}

      {currentPage === AppState.CHAT_LIST && (
        <div className="fixed inset-0 bg-[#070708] z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
          <Header title="Sussurros" onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="flex-1 overflow-y-auto px-8 pb-40 no-scrollbar space-y-10 pt-4">
            {likesList.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-500">Desejos Revelados</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                   {likesList.map(p => (
                     <div key={p.uid} className="relative shrink-0 cursor-pointer" onClick={() => setViewingLikeProfile(p)}>
                        <div className="w-20 h-20 rounded-[2.2rem] border-2 border-indigo-500/20 overflow-hidden p-1 bg-[#0d0d0f] hover:border-indigo-500 transition-all">
                           <img src={p.photos[0]} className="w-full h-full object-cover rounded-[1.8rem] blur-2xl grayscale brightness-50" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5 border-4 border-[#070708]"><Heart size={10} fill="white" /></div>
                     </div>
                   ))}
                </div>
              </div>
            )}
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-600">Conexões Ativas</h3>
              {chatHistory.length > 0 ? chatHistory.map(chat => (
                <div key={chat.id} onClick={() => { setActiveChat(chat); setCurrentPage(AppState.CHAT); }} className="p-6 bg-[#0d0d0f] rounded-[2.5rem] border border-white/5 flex items-center gap-5 active:scale-95 transition-all shadow-xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/10 shadow-xl">
                    <img src={chat.partner.photos[0]} className="w-full h-full object-cover blur-sm" alt="Parceiro" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-serif italic text-white mb-0.5">{chat.partner.name}</h4>
                    <p className="text-xs text-gray-500 italic truncate w-40">Continuar sussurros...</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-24 opacity-20 italic font-serif text-2xl flex flex-col items-center gap-6">
                  <MessageCircle size={56} className="text-gray-700" />
                  Aguardando um sussurro...
                </div>
              )}
            </div>
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.PROFILE && (
        <div className="fixed inset-0 bg-[#070708] z-[100] flex flex-col animate-in slide-in-from-bottom-10 duration-500">
          <Header title="Identidade" onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="flex-1 overflow-y-auto px-10 pb-48 no-scrollbar space-y-12 pt-4">
             <div className="w-full aspect-square rounded-[4rem] overflow-hidden border-4 border-[#0d0d0f] relative shadow-[0_40px_80px_rgba(0,0,0,0.85)]">
                <img src={currentUser?.photos[0] || MOCK_USER.photos[0]} className="w-full h-full object-cover" alt="Sua Foto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95" />
                <div className="absolute bottom-8 left-8">
                  <h2 className="text-4xl font-serif italic text-white mb-2">{currentUser?.name || 'Membro Noir'}</h2>
                  <Badge active>{currentUser?.gender || 'Essência Oculta'}</Badge>
                </div>
             </div>
             <Button variant="outline" fullWidth onClick={handleLogout} className="h-16 text-red-500 border-red-500/20 hover:bg-red-500/5 rounded-3xl">
                <LogOut size={20} className="mr-3" /> Encerrar Jornada
             </Button>
          </div>
          <BottomNav />
        </div>
      )}

      {ndaModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
          <Card className="relative p-12 text-center border-indigo-500/20 bg-[#0d0d0f]/80 max-w-sm rounded-[4rem] shadow-[0_0_100px_rgba(79,70,229,0.2)]">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 shadow-inner">
               <Shield className="text-indigo-500" size={56} />
            </div>
            <h2 className="text-4xl font-serif italic mb-6 text-white tracking-tight">Pacto de Honra</h2>
            <p className="text-sm text-gray-400 italic mb-14 leading-relaxed font-serif">
              "O VÉU caiu. O que for sussurrado ou mostrado nesta frequência é sagrado e morre aqui."
            </p>
            <Button fullWidth onClick={() => setNdaModalOpen(false)} className="h-20 text-xl font-serif italic">Eu Juro pelo Sigilo</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;
