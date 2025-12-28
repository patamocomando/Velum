
import React, { useState, useMemo, useRef } from 'react';
import { 
  Shield, Heart, MessageSquare, User, Lock, MapPin, ArrowRight, Camera, 
  Ghost, Send, Key, ChevronLeft, X, Check, Plus, Mail, Eye, EyeOff, 
  Sparkles, Wine, Music, Flame, Coffee, CameraOff, MessageCircle, Navigation
} from 'lucide-react';
import { AppState, Objective, Gender, Profile, ChatSession, Message, UserLocation } from './types';
import { MOCK_USER, MOCK_PROFILES, STATES_CITIES } from './constants';
import { calculateDistance, generateId } from './utils';
import { Button, Input, Card, Badge, Header } from './components/UI';

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
  
  // Swipe Logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Discovery / Filters
  const [selectedCategory, setSelectedCategory] = useState<Objective | 'Geral'>('Geral');
  
  // Chats
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [ndaModalOpen, setNdaModalOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [tempProfile, setTempProfile] = useState<Partial<Profile>>({
    photos: [],
    objectives: [],
    tags: [],
    gender: undefined,
    isPrivate: true,
    bio: '',
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', state: 'Paraíba', type: 'GPS' }
  });

  // --- DERIVED STATE ---
  const filteredProfiles = useMemo(() => {
    let list = [...MOCK_PROFILES];
    if (selectedCategory !== 'Geral') {
      list = list.filter(p => p.objectives.includes(selectedCategory as Objective));
    }
    return list;
  }, [selectedCategory]);

  // --- HANDLERS ---
  const goToNextCard = () => {
    setCurrentIndex(prev => prev + 1);
    setSwipeOffset(0);
    setPhotoIndex(0);
  };

  const handleAction = (type: 'like' | 'dislike') => {
    const profile = filteredProfiles[currentIndex];
    if (!profile) return;

    if (type === 'like') {
      const newChat: ChatSession = {
        id: generateId(),
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
      goToNextCard();
    }, 250);
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setSwipeOffset(currentX - startX.current);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 120;
    if (swipeOffset > threshold) {
      handleAction('like');
    } else if (swipeOffset < -threshold) {
      handleAction('dislike');
    } else {
      setSwipeOffset(0);
    }
  };

  const sendMessage = (text: string) => {
    if (!activeChat || !text.trim()) return;
    const newMessage: Message = {
      id: generateId(),
      senderId: 'me',
      text,
      timestamp: Date.now()
    };
    setActiveChat({
      ...activeChat,
      messages: [...activeChat.messages, newMessage]
    });
  };

  const handleRequestGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setTempProfile({
          ...tempProfile,
          location: {
            ...tempProfile.location!,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            type: 'GPS',
            city: 'Localização Atual'
          }
        });
      });
    }
  };

  // --- REUSABLE COMPONENTS ---
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#070708]/90 backdrop-blur-3xl border-t border-white/5 py-4 px-10 flex justify-between items-center z-50">
      <button onClick={() => setCurrentPage(AppState.DISCOVER)} className={`p-3 transition-all active:scale-90 ${currentPage === AppState.DISCOVER ? 'text-indigo-500' : 'text-gray-600'}`}>
        <Heart size={24} fill={currentPage === AppState.DISCOVER ? 'currentColor' : 'none'} />
      </button>
      <button onClick={() => setCurrentPage(AppState.VAULT)} className={`p-3 transition-all active:scale-90 ${currentPage === AppState.VAULT ? 'text-indigo-500' : 'text-gray-600'}`}>
        <Key size={24} />
      </button>
      <button onClick={() => setCurrentPage(AppState.CHAT_LIST)} className={`p-3 transition-all active:scale-90 ${currentPage === AppState.CHAT_LIST ? 'text-indigo-500' : 'text-gray-600'}`}>
        <div className="relative">
          <MessageCircle size={24} />
          {chatHistory.length > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />}
        </div>
      </button>
      <button onClick={() => setCurrentPage(AppState.PROFILE)} className={`p-3 transition-all active:scale-90 ${currentPage === AppState.PROFILE ? 'text-indigo-500' : 'text-gray-600'}`}>
        <User size={24} />
      </button>
    </div>
  );

  // --- RENDER FUNCTIONS ---
  const renderLanding = () => (
    <div className="min-h-screen relative flex flex-col justify-center p-8 overflow-hidden animate-in fade-in duration-1000">
      {/* BACKGROUND IMAGE - Luxurious, dark, intimate nightclub vibe */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541532746401-cc0904000301?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover brightness-[0.35]"
          alt="Noir Nightclub Atmosphere"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-[#070708]/40" />
        <div className="absolute inset-0 bg-indigo-900/5 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* SHIELD ICON CIRCLE - Matches the reference image */}
        <div className="w-28 h-28 bg-[#0a0a0b] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-500/20">
          <Shield className="text-indigo-500" size={48} strokeWidth={1.2} />
        </div>

        {/* LOGO TITLE - Playfair Serif Italicized */}
        <h1 className="text-8xl font-serif italic text-white tracking-tighter mb-1 select-none">VELUM</h1>
        <p className="text-gray-300 uppercase tracking-[0.7em] text-[12px] font-black mb-12 text-center opacity-80 select-none">NOIR SOCIETY</p>
        
        {/* IMPACT PHRASE */}
        <p className="text-indigo-100/60 font-serif italic text-lg mb-16 text-center max-w-[280px] leading-snug">
          "Onde o sigilo é o nosso pacto e a liberdade o seu desejo."
        </p>

        {/* ACTION BUTTONS - High contrast layout as per the image */}
        <div className="w-full max-w-sm space-y-5">
          <Button variant="secondary" fullWidth onClick={() => setCurrentPage(AppState.SIGNUP)}>
            Começar Jornada
          </Button>
          <Button variant="outline" fullWidth onClick={() => setCurrentPage(AppState.LOGIN)}>
            Entrar no Sigilo
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 z-10 text-center px-8 opacity-40">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">
          Privacidade • Consentimento • Liberdade
        </p>
      </div>
    </div>
  );

  const renderOnboarding = () => {
    const steps = [
      { id: 1, title: 'Identidade', desc: 'Quem é você?' },
      { id: 2, title: 'Essência', desc: 'Identidade Sexual' },
      { id: 3, title: 'Desejos', desc: 'O que busca?' },
      { id: 4, title: 'Narrativa', desc: 'Sua História' },
      { id: 5, title: 'Visual', desc: 'Sua Galeria' },
      { id: 6, title: 'Território', desc: 'Sua Localização' },
      { id: 7, title: 'Privacidade', desc: 'O VÉU' }
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
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-4">
              {Object.values(Gender).map(g => (
                <button key={g} onClick={() => setTempProfile({...tempProfile, gender: g})} className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all ${tempProfile.gender === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-gray-500'}`}>{g}</button>
              ))}
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-4">
              {Object.values(Objective).map(obj => {
                const isSelected = tempProfile.objectives?.includes(obj);
                return (
                  <button 
                    key={obj} 
                    onClick={() => {
                      const cur = tempProfile.objectives || [];
                      setTempProfile({...tempProfile, objectives: isSelected ? cur.filter(o => o !== obj) : [...cur, obj]});
                    }}
                    className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 text-gray-500'}`}
                  >{obj}</button>
                );
              })}
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <textarea className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white focus:border-indigo-600/50 outline-none h-40 leading-relaxed" placeholder="Como é sua vibe Noir?" value={tempProfile.bio || ''} onChange={e => setTempProfile({...tempProfile, bio: e.target.value})} />
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_TAGS.map(tag => (
                  <button key={tag.label} onClick={() => {
                    const cur = tempProfile.tags || [];
                    setTempProfile({...tempProfile, tags: cur.includes(tag.label) ? cur.filter(t => t !== tag.label) : [...cur, tag.label]});
                  }} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${tempProfile.tags?.includes(tag.label) ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    {tag.icon} {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardingStep === 5 && (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in zoom-in duration-300">
              {Array.from({ length: 9 }).map((_, i) => (
                <button key={i} onClick={() => {
                  const cur = tempProfile.photos || [];
                  if (cur.length < 10) setTempProfile({...tempProfile, photos: [...cur, `https://picsum.photos/seed/${generateId()}/600/800`]});
                }} className="aspect-[3/4] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden hover:bg-white/[0.08] transition-all relative">
                  {tempProfile.photos?.[i] ? <img src={tempProfile.photos[i]} className="w-full h-full object-cover" /> : <Plus className="text-gray-700" />}
                </button>
              ))}
            </div>
          )}

          {onboardingStep === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Localização Atual</p>
                <button 
                  onClick={handleRequestGPS}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${tempProfile.location?.type === 'GPS' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Navigation size={18} />
                    <span className="font-bold">Ativar GPS</span>
                  </div>
                  {tempProfile.location?.type === 'GPS' && <Check size={18} />}
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Modo Viagem</p>
                <div className="space-y-3">
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none"
                    value={tempProfile.location?.state || ''}
                    onChange={(e) => setTempProfile({...tempProfile, location: {...tempProfile.location!, state: e.target.value, type: 'MANUAL'}})}
                  >
                    <option value="" disabled className="bg-black">Selecione o Estado</option>
                    {Object.keys(STATES_CITIES).map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                  </select>

                  {tempProfile.location?.state && (
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none animate-in fade-in"
                      value={tempProfile.location?.city || ''}
                      onChange={(e) => setTempProfile({...tempProfile, location: {...tempProfile.location!, city: e.target.value, type: 'MANUAL'}})}
                    >
                      <option value="" disabled className="bg-black">Selecione a Cidade</option>
                      {(STATES_CITIES as any)[tempProfile.location.state].map((c: string) => <option key={c} value={c} className="bg-black">{c}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {onboardingStep === 7 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                <img src={tempProfile.photos?.[0] || 'https://picsum.photos/seed/placeholder/600/800'} className={`w-full h-full object-cover transition-all duration-1000 ${tempProfile.isPrivate ? 'blur-3xl grayscale brightness-50' : ''}`} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="text-center p-8 bg-black/20 rounded-3xl border border-white/10 backdrop-blur-md">
                    {tempProfile.isPrivate ? <Ghost size={40} className="mx-auto mb-4 text-indigo-400" /> : <Eye size={40} className="mx-auto mb-4 text-indigo-400" />}
                    <h4 className="text-white font-serif italic text-xl mb-1">{tempProfile.isPrivate ? 'Modo Sigilo Ativo' : 'Modo Nítido'}</h4>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{tempProfile.isPrivate ? 'Rosto oculto até o match' : 'Visibilidade total'}</p>
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
            if (onboardingStep < 7) setOnboardingStep(s => s + 1);
            else {
              setCurrentUser({...MOCK_USER, ...tempProfile} as Profile);
              setCurrentPage(AppState.DISCOVER);
            }
          }}>
            {onboardingStep === 7 ? 'Iniciar Jornada' : 'Próximo'}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    );
  };

  const renderDiscover = () => {
    const profile = filteredProfiles[currentIndex];
    const isOutOfCards = currentIndex >= filteredProfiles.length;
    
    const cardStyle = {
      transform: `translateX(${swipeOffset}px) rotate(${swipeOffset / 10}deg)`,
      transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      opacity: isDragging ? 1 : (Math.abs(swipeOffset) > 200 ? 0 : 1)
    };

    return (
      <div className="min-h-screen bg-[#070708] flex flex-col pb-24 max-w-md mx-auto relative overflow-hidden animate-in fade-in duration-500">
        <Header title="VELUM" rightElement={<button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-indigo-500"><Lock size={20} /></button>} />
        
        <div className="px-8 flex gap-3 overflow-x-auto no-scrollbar mb-4">
          {['Geral', ...Object.values(Objective)].map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat as any); setCurrentIndex(0); }} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>{cat}</button>
          ))}
        </div>

        <div className="flex-1 px-8 relative flex flex-col">
          {!isOutOfCards ? (
            <>
              <div 
                className="w-full h-[60vh] relative group cursor-grab active:cursor-grabbing"
                onMouseDown={handleTouchStart} onMouseMove={handleTouchMove} onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
              >
                <Card className="w-full h-full absolute inset-0 z-10 select-none shadow-2xl border-white/5" style={cardStyle}>
                  <div className="absolute top-6 left-8 right-8 z-30 flex gap-1.5">
                    {profile.photos.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i === photoIndex ? 'bg-white' : 'bg-white/20'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex z-30">
                    <div className="w-1/2 h-full" onClick={(e) => { e.stopPropagation(); setPhotoIndex(p => Math.max(0, p - 1)); }} />
                    <div className="w-1/2 h-full" onClick={(e) => { e.stopPropagation(); setPhotoIndex(p => Math.min(profile.photos.length - 1, p + 1)); }} />
                  </div>
                  <img src={profile.photos[photoIndex]} className={`w-full h-full object-cover transition-all duration-700 ${profile.isPrivate ? 'blur-3xl grayscale brightness-75' : ''}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
                    <h4 className="text-3xl font-serif italic text-white mb-2">{profile.name}, {profile.age}</h4>
                    <div className="flex flex-wrap gap-1.5 mb-2">{profile.objectives.map(o => <Badge key={o} active>{o}</Badge>)}</div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black flex items-center gap-1.5"><MapPin size={10} className="text-indigo-500" /> {profile.location.city} • {calculateDistance(currentUser?.location || MOCK_USER.location, profile.location)}km</p>
                  </div>
                </Card>
              </div>

              <div className="mt-8 flex justify-center items-center gap-8">
                <button onClick={() => handleAction('dislike')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-red-500 active:scale-90 transition-all shadow-xl"><X size={28} /></button>
                <button onClick={() => handleAction('like')} className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white active:scale-90 transition-all shadow-indigo-600/30 shadow-2xl"><Heart size={36} fill="white" /></button>
                <button onClick={() => handleAction('dislike')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-green-500 active:scale-90 transition-all shadow-xl"><Check size={28} /></button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 animate-in zoom-in">
              <Sparkles className="mx-auto text-indigo-500/20 mb-6" size={64} />
              <h3 className="text-2xl font-serif italic">Sem novos segredos</h3>
              <p className="text-gray-500 text-sm mt-2 font-light">Mude os filtros para descobrir mais.</p>
              <Button variant="outline" className="mt-8" onClick={() => setCurrentIndex(0)}>Ver Novamente</Button>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  };

  const renderChatList = () => (
    <div className="min-h-screen bg-[#070708] flex flex-col pb-24 max-w-md mx-auto animate-in fade-in duration-500">
      <Header title="Diálogos" />
      <div className="px-8 space-y-4">
        {chatHistory.length > 0 ? chatHistory.map(chat => (
          <div key={chat.id} onClick={() => { setActiveChat(chat); setCurrentPage(AppState.CHAT); }} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4 active:scale-95 transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 relative">
              <img src={chat.partner.photos[0]} className={`w-full h-full object-cover ${!chat.ndaAccepted ? 'blur-md grayscale' : ''}`} />
              {!chat.ndaAccepted && <Lock size={12} className="absolute inset-0 m-auto text-white/50" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">{chat.partner.name}</h4>
              <p className="text-xs text-gray-500 line-clamp-1 italic">{chat.messages[chat.messages.length - 1].text}</p>
            </div>
            <div className="text-[9px] text-gray-600 font-black uppercase">{new Date(chat.messages[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )) : (
          <div className="text-center py-32 opacity-20">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p className="font-serif italic">Nenhum sussurro ainda...</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );

  const renderChat = () => {
    if (!activeChat) return null;
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col max-w-md mx-auto animate-in slide-in-from-right duration-400">
        <Header title={activeChat.partner.name} onBack={() => setCurrentPage(AppState.CHAT_LIST)} />
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 no-scrollbar">
          {!activeChat.ndaAccepted && (
            <div className="bg-indigo-600/10 border border-indigo-600/20 p-6 rounded-3xl text-center space-y-4">
              <Shield className="mx-auto text-indigo-500" size={32} />
              <p className="text-xs text-indigo-200/70 italic leading-relaxed">"O Pacto de Honra deve ser aceito para revelar as identidades deste diálogo."</p>
              <Button onClick={() => setNdaModalOpen(true)}>Ler Pacto</Button>
            </div>
          )}
          {activeChat.messages.map(m => (
            <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm ${m.senderId === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 pb-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-2 flex gap-2">
            <input 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage((e.target as any).value)}
              placeholder="Fale no VÉU..." className="flex-1 bg-transparent px-4 outline-none text-sm" 
            />
            <button className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Send size={18} /></button>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const user = currentUser || MOCK_USER;
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col pb-24 max-w-md mx-auto animate-in fade-in duration-500">
        <div className="relative h-[45vh] overflow-hidden">
          <img src={user.photos[photoIndex] || user.photos[0]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent" />
          <div className="absolute bottom-10 left-10">
            <h2 className="text-5xl font-serif italic text-white mb-2">{user.name}, {user.age}</h2>
            <div className="flex gap-2"><Badge active>{user.gender}</Badge>{user.isPrivate && <Badge active>Sigilo</Badge>}</div>
          </div>
        </div>
        <div className="px-10 py-10 space-y-10">
          <div className="grid grid-cols-5 gap-3">
            {user.photos.map((p, i) => (
              <button key={i} onClick={() => setPhotoIndex(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === photoIndex ? 'border-indigo-500' : 'border-white/5'}`}>
                <img src={p} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-600 flex items-center gap-2"><div className="w-6 h-[1px] bg-white/10" /> Minha Bio</h3>
            <p className="text-lg font-serif italic text-gray-300 leading-relaxed">"{user.bio}"</p>
          </div>
          <Button variant="outline" fullWidth onClick={() => { setCurrentUser(null); setCurrentPage(AppState.LANDING); }}>Desconectar</Button>
        </div>
        <BottomNav />
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-[#070708] text-white min-h-screen relative font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {currentPage === AppState.LANDING && renderLanding()}
      {currentPage === AppState.LOGIN && <div className="p-10"><Header title="Acesso" onBack={() => setCurrentPage(AppState.LANDING)} /><div className="mt-20 space-y-6"><Input placeholder="Email" /><Input placeholder="Senha" type="password" /><Button fullWidth onClick={() => { setCurrentUser(MOCK_USER); setCurrentPage(AppState.DISCOVER); }}>Entrar</Button></div></div>}
      {currentPage === AppState.SIGNUP && renderOnboarding()}
      {currentPage === AppState.DISCOVER && renderDiscover()}
      {currentPage === AppState.CHAT_LIST && renderChatList()}
      {currentPage === AppState.CHAT && renderChat()}
      {currentPage === AppState.PROFILE && renderProfile()}
      {currentPage === AppState.VAULT && <div className="p-10 h-screen"><Header title="Cofre" /><div className="mt-40 text-center opacity-30"><Lock size={64} className="mx-auto mb-6" /><p className="font-serif italic text-xl">Suas fotos privadas</p><p className="text-xs mt-2 uppercase tracking-widest">Em breve</p></div><BottomNav /></div>}

      {/* NDA Modal */}
      {ndaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
          <Card className="relative p-10 text-center border-indigo-500/20 shadow-2xl bg-black/40">
            <Shield className="mx-auto text-indigo-500 mb-6" size={48} />
            <h2 className="text-3xl font-serif italic mb-6">Pacto de Honra</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-10 italic">"No VELUM, as máscaras caem, mas os segredos permanecem. Juramos sigilo total sobre o que for visto e dito."</p>
            <Button fullWidth onClick={() => { if (activeChat) setActiveChat({...activeChat, ndaAccepted: true}); setNdaModalOpen(false); }}>Eu Juro</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;
