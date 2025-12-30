
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Heart, User, Lock, MapPin, Ghost, MessageCircle, Globe, Zap, 
  Eye, EyeOff, Navigation, Edit3, Plus, X, LocateFixed, Fingerprint, Camera, Trash2,
  Sparkles, LockKeyhole, ChevronLeft, Music, Smile, Dumbbell, Info, ShieldCheck, Compass,
  CheckCircle2, Phone, LogOut, Send, Unlock
} from 'lucide-react';
import { AppState, Objective, Gender, Profile, Mood, Message } from './types';
import { MOCK_USER, MOCK_PROFILES, TRAVEL_CITIES, OPTIONS } from './constants';
import { generateId, calculateDistance } from './utils';
import { Button, Input, Card, Badge, Header } from './components/UI';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Auth State
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loginPhone, setLoginPhone] = useState(''); 
  const [loginRealName, setLoginRealName] = useState(''); 
  const [loginPassword, setLoginPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  
  // Onboarding & Tutorial
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [formProfile, setFormProfile] = useState<Partial<Profile>>({
    photos: [],
    vaultPhotos: [],
    seeking: [],
    objectives: [],
    bio: '',
    age: undefined,
    music: [],
    environment: [],
    interests: [],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', type: 'GPS' }
  });
  
  // Chat & Discovery
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null);
  const [revealedVaults, setRevealedVaults] = useState<Record<string, boolean>>({}); 
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  const [messageInput, setMessageInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vaultFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const activeUserId = localStorage.getItem('velum_active_uid');
        if (activeUserId) {
          const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
          const profile = allAccounts[activeUserId];
          if (profile) {
            setCurrentUser(profile);
            setCurrentPage(AppState.DISCOVER);
          }
        }
        
        const savedChats = localStorage.getItem('velum_chats');
        if (savedChats) {
          setChatHistory(JSON.parse(savedChats));
        }
      } catch (e) {
        console.error("Falha ao carregar sessão anterior:", e);
      } finally {
        setTimeout(() => setIsLoading(false), 1200);
      }
    };
    initApp();
  }, []);

  const handleAuth = () => {
    const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    
    if (!loginPhone || !loginPassword) {
      alert("Número e Chave são obrigatórios.");
      return;
    }

    if (isSignupMode) {
      const userExists = Object.values(allAccounts).some((u: any) => u.phone === loginPhone);
      if (userExists) { 
        alert("Este número já foi iniciado por outro membro."); 
        return; 
      }

      const newUid = generateId();
      setFormProfile(prev => ({
        ...prev,
        uid: newUid,
        phone: loginPhone,
        username: loginPhone, 
        name: loginRealName || 'Membro',
      }));
      (window as any)._tempPass = loginPassword;
      
      setOnboardingStep(1);
      setCurrentPage(AppState.ONBOARDING);
    } else {
      const foundUser = Object.values(allAccounts).find((u: any) => 
        u.phone === loginPhone && u.password === loginPassword
      ) as Profile;
      
      if (foundUser) {
        setCurrentUser(foundUser);
        if (rememberMe) localStorage.setItem('velum_active_uid', foundUser.uid);
        setCurrentPage(AppState.DISCOVER);
      } else if (loginPhone === '123' && loginPassword === '123') {
        setCurrentUser(MOCK_USER);
        if (rememberMe) localStorage.setItem('velum_active_uid', MOCK_USER.uid);
        setCurrentPage(AppState.DISCOVER);
      } else {
        alert("Credenciais Noir não encontradas ou inválidas.");
      }
    }
  };

  const handleSaveProfile = (isEdit: boolean, updatedProfile?: Profile) => {
    const profileToUse = updatedProfile || (isEdit ? currentUser : formProfile);
    if (!profileToUse || !profileToUse.uid) return;

    const finalProfile = {
      ...(isEdit ? currentUser : {}),
      ...profileToUse,
      photos: profileToUse.photos?.length ? profileToUse.photos : (isEdit ? currentUser?.photos : []),
      vaultPhotos: profileToUse.vaultPhotos || (isEdit ? currentUser?.vaultPhotos : [])
    } as Profile;

    let passwordToStore = (window as any)._tempPass;
    const allAccountsBefore = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    
    // Preserve password if it exists
    if (isEdit && allAccountsBefore[finalProfile.uid]) {
      passwordToStore = allAccountsBefore[finalProfile.uid].password;
    }
    
    try {
      allAccountsBefore[finalProfile.uid] = { ...finalProfile, password: passwordToStore };
      localStorage.setItem('velum_accounts', JSON.stringify(allAccountsBefore));
      
      setCurrentUser(finalProfile);
      if (rememberMe) localStorage.setItem('velum_active_uid', finalProfile.uid);
      
      if (isEdit && !updatedProfile) {
        setCurrentPage(AppState.PROFILE);
      } else if (!isEdit) {
        setCurrentPage(AppState.SIGNUP);
      }
    } catch (e) {
      alert("Erro ao salvar dados localmente.");
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedPartner || !currentUser) return;

    const newMessage: Message = {
      id: generateId(),
      senderId: currentUser.uid,
      text: messageInput.trim(),
      timestamp: Date.now()
    };

    const newHistory = {
      ...chatHistory,
      [selectedPartner.uid]: [...(chatHistory[selectedPartner.uid] || []), newMessage]
    };

    setChatHistory(newHistory);
    localStorage.setItem('velum_chats', JSON.stringify(newHistory));
    setMessageInput('');
  };

  const handleLogout = () => {
    if (confirm("Deseja realmente sair da sua sessão Noir?")) {
      localStorage.removeItem('velum_active_uid'); 
      setCurrentUser(null); 
      setLoginPhone('');
      setLoginPassword('');
      setIsSignupMode(false);
      setCurrentPage(AppState.LANDING);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("ATENÇÃO: Sua identidade será permanentemente removida do Véu. Esta ação é irreversível. Prosseguir?")) {
      const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
      if (currentUser?.uid) {
        delete allAccounts[currentUser.uid];
        localStorage.setItem('velum_accounts', JSON.stringify(allAccounts));
      }
      localStorage.removeItem('velum_active_uid'); 
      setCurrentUser(null); 
      setCurrentPage(AppState.LANDING);
    }
  };

  const handleSelectCity = (city: string) => {
    if (currentPage === AppState.ONBOARDING) {
      setFormProfile(prev => ({
        ...prev,
        location: { ...prev.location!, city, type: 'MANUAL' }
      }));
    } else if (currentPage === AppState.EDIT_PROFILE) {
      setCurrentUser(prev => prev ? ({
        ...prev,
        location: { ...prev.location, city, type: 'MANUAL' }
      }) : null);
    } else {
      if (!currentUser) return;
      const newLocation = { ...currentUser.location, city, type: 'MANUAL' as const };
      const updated = { ...currentUser, location: newLocation };
      handleSaveProfile(true, updated);
      setIsTravelModeOpen(false);
      setCurrentIndex(0);
    }
  };

  const requestGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLoc = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude, 
          city: 'Localização GPS', 
          type: 'GPS' as const 
        };
        
        if (currentPage === AppState.ONBOARDING) {
          setFormProfile(prev => ({ ...prev, location: newLoc }));
          alert("GPS Autorizado.");
        } else if (currentPage === AppState.EDIT_PROFILE) {
          setCurrentUser(prev => prev ? ({ ...prev, location: newLoc }) : null);
          alert("GPS Atualizado.");
        } else if (currentUser) {
          const updated = { ...currentUser, location: newLoc };
          handleSaveProfile(true, updated);
          setIsTravelModeOpen(false);
          setCurrentIndex(0);
        }
      }, (err) => {
        alert("Permissão de GPS negada.");
      });
    } else {
      alert("Aparelho sem Geolocalização.");
    }
  };

  const handlePhotoRequest = (isEdit: boolean, isVault: boolean = false) => {
    const confirmMsg = isVault 
      ? "Acessar galeria para Vault Seguro?"
      : "Acessar galeria para perfil público?";
      
    if (confirm(confirmMsg)) {
      if (isVault) vaultFileInputRef.current?.click();
      else fileInputRef.current?.click();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const target = isEdit ? currentUser : formProfile;
    if (!target) return;

    if ((target.photos?.length || 0) >= 3) { 
      alert("Máximo de 3 fotos."); 
      return; 
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (isEdit) {
        setCurrentUser(prev => prev ? ({ ...prev, photos: [...(prev.photos || []), base64] }) : null);
      } else {
        setFormProfile(prev => ({ ...prev, photos: [...(prev.photos || []), base64] }));
      }
    };
    reader.readAsDataURL(files[0]);
  };

  const handleVaultPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentUser) return;

    if ((currentUser.vaultPhotos?.length || 0) >= 2) {
      alert("Máximo 2 fotos no Vault.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const updated = { ...currentUser, vaultPhotos: [...(currentUser.vaultPhotos || []), base64] };
      handleSaveProfile(true, updated);
    };
    reader.readAsDataURL(files[0]);
  };

  const handleNextSwipe = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const openChat = (partner: Profile) => {
    setSelectedPartner(partner);
    setCurrentPage(AppState.CHAT);
  };

  const toggleRevealVault = () => {
    if (!selectedPartner || !currentUser) return;
    const isCurrentlyRevealed = revealedVaults[selectedPartner.uid];
    setRevealedVaults(prev => ({
      ...prev,
      [selectedPartner.uid]: !isCurrentlyRevealed
    }));
  };

  const filteredProfiles = useMemo(() => {
    if (!currentUser) return [];
    let list = [...MOCK_PROFILES];
    if (currentUser.seeking?.length) {
      list = list.filter(p => currentUser.seeking.includes(p.gender));
    }
    const currentCity = currentUser.location?.city || 'João Pessoa';
    if (currentUser.location.type === 'MANUAL') {
      list = list.filter(p => p.location.city === currentCity);
    }
    return list.map(p => ({ ...p, distance: calculateDistance(currentUser.location, p.location) }));
  }, [currentUser]);

  const tutorialPages = [
    { icon: Sparkles, title: "Descoberta", desc: "Navegue pelos membros da sociedade Noir." },
    { icon: Lock, title: "O Vault", desc: "Seu cofre pessoal e secreto." },
    { icon: MessageCircle, title: "Sussurros", desc: "Conversas totalmente criptografadas." },
    { icon: Globe, title: "Itinerante", desc: "Explore outras cidades do Véu." }
  ];

  const BottomNav = () => (
    <nav className="shrink-0 h-20 bg-[#070708]/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 z-[100] safe-area-bottom">
      {[
        { id: AppState.DISCOVER, icon: Sparkles },
        { id: AppState.CHAT_LIST, icon: MessageCircle },
        { id: AppState.VAULT, icon: LockKeyhole },
        { id: AppState.PROFILE, icon: User }
      ].map((item) => (
        <button 
          key={item.id}
          onClick={() => {
            if (item.id === AppState.CHAT_LIST && currentPage === AppState.CHAT) return;
            setCurrentPage(item.id);
          }} 
          className={`p-3 transition-all duration-300 ${currentPage === item.id || (currentPage === AppState.CHAT && item.id === AppState.CHAT_LIST) || (currentPage === AppState.VIEW_PARTNER && item.id === AppState.CHAT_LIST) ? 'text-indigo-500 scale-125' : 'text-gray-600'}`}
        >
          <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 2} />
        </button>
      ))}
    </nav>
  );

  const SelectionChips = ({ options, value, onChange, multiple = false }: any) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt: string) => {
        const active = multiple ? value?.includes(opt) : value === opt;
        return (
          <button
            key={opt}
            onClick={() => {
              if (multiple) {
                const arr = Array.isArray(value) ? value : [];
                onChange(arr.includes(opt) ? arr.filter((x: any) => x !== opt) : [...arr, opt]);
              } else onChange(opt);
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500'}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#070708] overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 z-[1000] bg-[#070708] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <h1 className="text-xl font-serif italic text-white animate-pulse">VELUM</h1>
        </div>
      )}

      {currentPage === AppState.LANDING && (
        <div className="flex-1 flex flex-col justify-center items-center px-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=100&w=1200" className="w-full h-full object-cover" alt="Noir background" />
          </div>
          <div className="relative z-10 w-full text-center">
            <h1 className="text-7xl font-serif italic text-white mb-2 tracking-tighter">VELUM</h1>
            <p className="text-gray-500 uppercase tracking-[0.6em] text-[9px] mb-12 font-black">NOIR SOCIETY</p>
            <div className="space-y-3 mb-6">
              {isSignupMode && <Input placeholder="Nome Real" value={loginRealName} onChange={e => setLoginRealName(e.target.value)} />}
              <Input type="tel" placeholder="Telefone (Login)" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Chave Privada" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 p-2">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5'}`}>
                {rememberMe && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Manter Conectado</span>
            </div>

            <Button fullWidth onClick={handleAuth}>{isSignupMode ? 'Iniciar Iniciação' : 'Acessar o Véu'}</Button>
            <button onClick={() => { setIsSignupMode(!isSignupMode); setLoginPhone(''); setLoginPassword(''); }} className="mt-8 text-[10px] uppercase font-black text-gray-500 hover:text-white transition-all tracking-widest">{isSignupMode ? 'Voltar' : 'Solicitar Iniciação'}</button>
          </div>
        </div>
      )}

      {currentPage === AppState.ONBOARDING && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title={`Iniciação ${onboardingStep}/6`} />
          <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-8 no-scrollbar py-6">
            {onboardingStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic text-white">Sua Natureza</h2>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Idade</p>
                  <Input type="number" placeholder="Sua idade" value={formProfile.age || ''} onChange={e => setFormProfile({...formProfile, age: parseInt(e.target.value) || undefined})} min={18} max={99} />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Gênero</p>
                  <SelectionChips options={OPTIONS.genders} value={formProfile.gender} onChange={(v: any) => setFormProfile({...formProfile, gender: v})} />
                  <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Buscando</p>
                  <SelectionChips options={OPTIONS.genders} value={formProfile.seeking} onChange={(v: any) => setFormProfile({...formProfile, seeking: v})} multiple />
                </div>
                <Button fullWidth onClick={() => { if (!formProfile.age || formProfile.age < 18) { alert("Mínimo 18 anos."); return; } setOnboardingStep(2); }}>Próximo</Button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic text-white">Sua Localização</h2>
                <button onClick={requestGPS} className="w-full flex items-center justify-between p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-left active:scale-[0.98] transition-all"><div className="flex items-center gap-4"><LocateFixed size={24} className="text-indigo-400" /><div><span className="block text-sm font-serif italic text-white">Ativar GPS</span><span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Precisão Noir</span></div></div></button>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Escolha sua Cidade</p>
                  <div className="grid grid-cols-2 gap-2">{TRAVEL_CITIES.map(c => (<button key={c} onClick={() => handleSelectCity(c)} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formProfile.location?.city === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{c}</button>))}</div>
                </div>
                <div className="flex gap-4"><Button variant="outline" className="flex-1" onClick={() => setOnboardingStep(1)}>Voltar</Button><Button className="flex-[2]" onClick={() => setOnboardingStep(3)}>Próximo</Button></div>
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic text-white">Suas Intenções</h2>
                <div className="space-y-4">
                   <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Objetivos</p>
                   <SelectionChips options={Object.values(Objective)} value={formProfile.objectives} onChange={(v: any) => setFormProfile({...formProfile, objectives: v})} multiple />
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Interesses</p>
                   <SelectionChips options={OPTIONS.sports} value={formProfile.interests} onChange={(v: any) => setFormProfile({...formProfile, interests: v})} multiple />
                </div>
                <div className="flex gap-4"><Button variant="outline" className="flex-1" onClick={() => setOnboardingStep(2)}>Voltar</Button><Button className="flex-[2]" onClick={() => setOnboardingStep(4)}>Próximo</Button></div>
              </div>
            )}
            {onboardingStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic text-white">Sua Frequência</h2>
                <div className="space-y-4">
                   <div className="flex items-center gap-2"><Music size={14} className="text-indigo-400" /><p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Música</p></div>
                   <SelectionChips options={OPTIONS.music} value={formProfile.music} onChange={(v: any) => setFormProfile({...formProfile, music: v})} multiple />
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-2"><Smile size={14} className="text-indigo-400" /><p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Vibe</p></div>
                   <SelectionChips options={OPTIONS.vibes} value={formProfile.environment} onChange={(v: any) => setFormProfile({...formProfile, environment: v})} multiple />
                </div>
                <div className="flex gap-4"><Button variant="outline" className="flex-1" onClick={() => setOnboardingStep(3)}>Voltar</Button><Button className="flex-[2]" onClick={() => setOnboardingStep(5)}>Próximo</Button></div>
              </div>
            )}
            {onboardingStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic text-white">Manifesto Noir</h2>
                <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all italic leading-relaxed" placeholder="Conte seu manifesto..." value={formProfile.bio} rows={8} onChange={(e) => setFormProfile({...formProfile, bio: e.target.value})} />
                <div className="flex gap-4"><Button variant="outline" className="flex-1" onClick={() => setOnboardingStep(4)}>Voltar</Button><Button className="flex-[2]" onClick={() => { if(!formProfile.bio) { alert("Sua bio é obrigatória."); return; } setOnboardingStep(6); }}>Próximo</Button></div>
              </div>
            )}
            {onboardingStep === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic text-white">Sua Galeria</h2>
                <input type="file" hidden ref={fileInputRef} onChange={(e) => handlePhotoUpload(e, false)} accept="image/*" />
                <div className="grid grid-cols-2 gap-4">
                  {(formProfile.photos || []).map((p, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-white/10">
                      <img src={p} className="w-full h-full object-cover" alt="User" />
                      <button onClick={() => setFormProfile(prev => ({...prev, photos: prev.photos?.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white"><X size={14}/></button>
                    </div>
                  ))}
                  {(formProfile.photos?.length || 0) < 3 && <button onClick={() => handlePhotoRequest(false)} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 bg-white/5"><Plus size={32} /></button>}
                </div>
                <div className="flex gap-4"><Button variant="outline" className="flex-1" onClick={() => setOnboardingStep(5)}>Voltar</Button><Button className="flex-[2]" onClick={() => handleSaveProfile(false)}>Concluir</Button></div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentPage === AppState.SIGNUP && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-12 animate-in fade-in">
          <ShieldCheck size={80} className="text-indigo-500 animate-pulse" />
          <h3 className="text-4xl font-serif italic text-white">Pacto de Silêncio</h3>
          <p className="text-xs text-gray-500 leading-relaxed italic max-w-[250px]">"O que acontece no Véu, permanece no Véu. Respeito e discrição absoluta."</p>
          <Button fullWidth onClick={() => { setTutorialStep(0); setCurrentPage(AppState.TUTORIAL); }}>Aceito o Pacto</Button>
        </div>
      )}

      {currentPage === AppState.TUTORIAL && (
        <div className="flex-1 flex flex-col h-full bg-[#070708] p-10 animate-in fade-in">
           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
              <div className="w-32 h-32 bg-indigo-600/10 rounded-[3rem] border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                 {React.createElement(tutorialPages[tutorialStep].icon, { size: 60 })}
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-serif italic text-white">{tutorialPages[tutorialStep].title}</h2>
                 <p className="text-sm text-gray-400 leading-relaxed italic px-4">{tutorialPages[tutorialStep].desc}</p>
              </div>
              <div className="flex gap-2">
                 {tutorialPages.map((_, i) => (
                   <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === tutorialStep ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`} />
                 ))}
              </div>
           </div>
           <div className="space-y-3">
              <Button fullWidth onClick={() => {
                if (tutorialStep < tutorialPages.length - 1) setTutorialStep(tutorialStep + 1);
                else setCurrentPage(AppState.DISCOVER);
              }}>{tutorialStep < tutorialPages.length - 1 ? 'Próximo' : 'Entrar na Sociedade'}</Button>
           </div>
        </div>
      )}

      {currentPage === AppState.DISCOVER && (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          <Header title={currentUser?.location?.city || 'Velum'} rightElement={
            <button onClick={() => setIsTravelModeOpen(true)} className="p-3 bg-white/5 rounded-2xl text-indigo-400 border border-white/10 active:scale-95 transition-all"><Globe size={20}/></button>
          } />
          <div className="flex-1 flex flex-col px-6 overflow-hidden relative">
            {filteredProfiles[currentIndex] ? (
              <div className="flex-1 flex flex-col relative min-h-0">
                <div className="flex-1 min-h-0 relative">
                  <Card className="h-full w-full border-none relative group overflow-hidden">
                    <img src={filteredProfiles[currentIndex].photos[0]} className="w-full h-full object-cover" alt="Profile" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-90" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                         <h2 className="text-3xl font-serif italic text-white leading-none">{filteredProfiles[currentIndex].name}, {filteredProfiles[currentIndex].age}</h2>
                         {filteredProfiles[currentIndex].isPrivate && <Lock size={16} className="text-indigo-400" />}
                      </div>
                      <div className="flex items-center gap-3 mb-3"><Badge active>{filteredProfiles[currentIndex].gender}</Badge><span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">{filteredProfiles[currentIndex].distance}KM</span></div>
                      <p className="text-gray-300 text-sm font-light italic line-clamp-2 opacity-80 leading-relaxed">"{filteredProfiles[currentIndex].bio}"</p>
                    </div>
                  </Card>
                </div>
                <div className="shrink-0 flex justify-center items-center gap-6 py-6">
                  <button onClick={handleNextSwipe} className="w-14 h-14 bg-[#0d0d0f] border border-white/10 rounded-full flex items-center justify-center text-red-500 active:scale-90 transition-all"><X size={24} /></button>
                  <button onClick={() => openChat(filteredProfiles[currentIndex])} className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl active:scale-95 transition-all"><MessageCircle size={36} fill="white"/></button>
                  <button onClick={handleNextSwipe} className="w-14 h-14 bg-[#0d0d0f] border border-white/10 rounded-full flex items-center justify-center text-yellow-400 active:scale-90 transition-all"><Zap size={22} fill="currentColor"/></button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center animate-in fade-in">
                <Ghost size={80} className="mb-6 text-indigo-500" />
                <h3 className="text-2xl font-serif italic text-white">Fim da frequência</h3>
                <Button variant="outline" className="mt-10" onClick={() => setCurrentIndex(0)}>Recarregar</Button>
              </div>
            )}
          </div>
          {isTravelModeOpen && (
            <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="flex flex-col h-full">
                <Header title="Frequência" onBack={() => setIsTravelModeOpen(false)} />
                <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                  <button onClick={requestGPS} className="w-full flex items-center justify-between p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-left active:scale-[0.98] transition-all"><div className="flex items-center gap-4"><LocateFixed size={24} className="text-indigo-400" /><div><span className="block text-sm font-serif italic text-white">Detectar GPS</span></div></div></button>
                  <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest px-2">Cidades Mapeadas</p>
                  <div className="grid grid-cols-1 gap-3">{TRAVEL_CITIES.map(city => (<button key={city} onClick={() => handleSelectCity(city)} className={`w-full p-6 rounded-3xl text-left transition-all active:scale-[0.98] border ${currentUser?.location.city === city ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}><span className="font-serif italic text-lg">{city}</span></button>))}</div>
                </div>
              </div>
            </div>
          )}
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.CHAT_LIST && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title="Sussurros" />
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
            {MOCK_PROFILES.map(p => (
              <button key={p.uid} onClick={() => openChat(p)} className="w-full flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-3xl active:scale-[0.98] transition-all">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0"><img src={p.photos[0]} className="w-full h-full object-cover" /></div>
                <div className="flex-1 text-left"><h4 className="font-serif italic text-white text-lg">{p.name}</h4><p className="text-xs text-gray-500 truncate">{chatHistory[p.uid]?.length > 0 ? chatHistory[p.uid][chatHistory[p.uid].length - 1].text : 'Clique para sussurrar...'}</p></div>
              </button>
            ))}
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.CHAT && selectedPartner && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title={selectedPartner.name} onBack={() => setCurrentPage(AppState.CHAT_LIST)} rightElement={<button onClick={toggleRevealVault} className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${revealedVaults[selectedPartner.uid] ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-indigo-400'}`}>{revealedVaults[selectedPartner.uid] ? <Unlock size={18}/> : <Lock size={18}/>}<span className="text-[10px] font-black uppercase tracking-widest">{revealedVaults[selectedPartner.uid] ? 'Revelado' : 'Revelar Vault'}</span></button>} />
          <button onClick={() => setCurrentPage(AppState.VIEW_PARTNER)} className="px-6 py-3 bg-indigo-600/5 border-b border-white/5 flex items-center justify-between text-left group"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-500/20"><img src={selectedPartner.photos[0]} className="w-full h-full object-cover" /></div><span className="text-[10px] uppercase font-black text-indigo-300 tracking-widest">Perfil Completo</span></div><ChevronLeft size={14} className="rotate-180 text-indigo-400" /></button>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col no-scrollbar bg-[#09090b]">
             {(chatHistory[selectedPartner.uid] || []).map((msg) => (<div key={msg.id} className={`max-w-[80%] p-4 rounded-2xl text-sm italic ${msg.senderId === currentUser?.uid ? 'self-end bg-indigo-600 text-white shadow-lg' : 'self-start bg-white/[0.05] border border-white/5 text-gray-200'}`}>{msg.text}</div>))}
          </div>
          <div className="p-6 bg-[#070708] border-t border-white/5 flex items-center gap-4 safe-area-bottom">
             <div className="flex-1 relative"><input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Sussurrar..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white text-sm" /></div>
             <button onClick={handleSendMessage} className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all shadow-lg"><Send size={20} /></button>
          </div>
        </div>
      )}

      {currentPage === AppState.VIEW_PARTNER && selectedPartner && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title={`Identidade Noir`} onBack={() => setCurrentPage(AppState.CHAT)} />
          <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-10 no-scrollbar py-6">
            <div className="aspect-square w-full rounded-[3.5rem] overflow-hidden relative shadow-2xl"><img src={selectedPartner.photos[0]} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" /><div className="absolute bottom-8 left-8 right-8"><div className="flex items-center gap-3 mb-2"><h2 className="text-3xl font-serif italic text-white">{selectedPartner.name}, {selectedPartner.age}</h2></div><div className="flex gap-2"><Badge active>{selectedPartner.gender}</Badge></div></div></div>
            <div className="space-y-4"><p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Manifesto</p><div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8"><p className="text-sm text-gray-300 italic leading-relaxed">"{selectedPartner.bio}"</p></div></div>
            <div className="grid grid-cols-2 gap-3">{selectedPartner.photos.map((p, i) => (<div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10"><img src={p} className="w-full h-full object-cover" /></div>))}</div>
          </div>
          <div className="shrink-0 p-6 safe-area-bottom border-t border-white/5"><Button fullWidth onClick={() => setCurrentPage(AppState.CHAT)}>Voltar aos Sussurros</Button></div>
        </div>
      )}

      {currentPage === AppState.VAULT && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title="Vault Seguro" />
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
            <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] p-8 text-center space-y-4"><Lock size={48} className="mx-auto text-indigo-400 opacity-50" /><h3 className="text-xl font-serif italic text-white">Seu Cofre Íntimo</h3></div>
            <div className="grid grid-cols-2 gap-4">
              {(currentUser?.vaultPhotos || []).map((p, i) => (<div key={i} className="aspect-[3/4] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl"><img src={p} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" /><button onClick={() => handleSaveProfile(true, { ...currentUser!, vaultPhotos: currentUser!.vaultPhotos.filter((_, idx) => idx !== i) })} className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white"><X size={16}/></button></div>))}
              {(currentUser?.vaultPhotos?.length || 0) < 2 && <button onClick={() => handlePhotoRequest(true, true)} className="aspect-[3/4] rounded-3xl border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 flex flex-col items-center justify-center text-indigo-400"><Plus size={40} /></button>}
            </div>
            <input type="file" hidden ref={vaultFileInputRef} onChange={handleVaultPhotoUpload} accept="image/*" />
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.PROFILE && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title="Identidade" rightElement={<button onClick={() => { setTutorialStep(0); setCurrentPage(AppState.TUTORIAL); }} className="p-3 bg-white/5 rounded-2xl text-indigo-400 border border-white/10 active:scale-95 transition-all"><Info size={20}/></button>} />
          <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-10 no-scrollbar py-6">
            <div className="aspect-square w-full rounded-[3.5rem] overflow-hidden relative shadow-2xl"><img src={currentUser?.photos[0] || MOCK_USER.photos[0]} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" /><div className="absolute bottom-8 left-8 right-8 flex items-end justify-between"><div><h2 className="text-3xl font-serif italic text-white mb-2">{currentUser?.name}</h2><Badge active>Membro Oficial</Badge></div><button onClick={() => setCurrentPage(AppState.EDIT_PROFILE)} className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all"><Edit3 size={20} /></button></div></div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentPage(AppState.VAULT)} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] text-center"><h4 className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-1">Vault</h4><p className="font-serif italic text-xl text-white">{currentUser?.vaultPhotos?.length || 0} Fotos</p></button>
              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] text-center"><h4 className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-1">Cidade</h4><p className="font-serif italic text-lg text-white truncate px-2">{currentUser?.location.city}</p></div>
            </div>
            <div className="flex gap-4 pb-12"><Button variant="outline" className="flex-1" onClick={handleLogout}><LogOut size={18} /> Sair</Button><Button variant="danger" className="flex-1" onClick={handleDeleteAccount}><Trash2 size={18} /> Excluir</Button></div>
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.EDIT_PROFILE && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
           <Header title="Editar Perfil" onBack={() => setCurrentPage(AppState.PROFILE)} />
           <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-12 no-scrollbar py-8">
              <section className="space-y-6">
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest border-b border-indigo-500/20 pb-2">Identidade</p>
                <div className="space-y-4">
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Nome Noir</p><Input value={currentUser?.name} onChange={(e) => setCurrentUser(prev => prev ? ({...prev, name: e.target.value}) : null)} /></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Idade</p><Input type="number" value={currentUser?.age} onChange={(e) => setCurrentUser(prev => prev ? ({...prev, age: parseInt(e.target.value) || 0}) : null)} /></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Gênero</p><SelectionChips options={OPTIONS.genders} value={currentUser?.gender} onChange={(v: any) => setCurrentUser(prev => prev ? ({...prev, gender: v}) : null)} /></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Buscando</p><SelectionChips options={OPTIONS.genders} value={currentUser?.seeking} onChange={(v: any) => setCurrentUser(prev => prev ? ({...prev, seeking: v}) : null)} multiple /></div>
                </div>
              </section>

              <section className="space-y-6">
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest border-b border-indigo-500/20 pb-2">Sua Base no Véu</p>
                <div className="space-y-4">
                  <button onClick={requestGPS} className="w-full flex items-center justify-between p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl text-left active:scale-[0.98] transition-all"><div className="flex items-center gap-3"><LocateFixed size={18} className="text-indigo-400" /><span className="text-xs font-serif italic text-white">Atualizar via GPS</span></div></button>
                  <div className="grid grid-cols-2 gap-2">{TRAVEL_CITIES.map(c => (<button key={c} onClick={() => handleSelectCity(c)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${currentUser?.location.city === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{c}</button>))}</div>
                </div>
              </section>

              <section className="space-y-6">
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest border-b border-indigo-500/20 pb-2">Intenções & Estilo</p>
                <div className="space-y-4">
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Objetivos</p><SelectionChips options={Object.values(Objective)} value={currentUser?.objectives} onChange={(v: any) => setCurrentUser(prev => prev ? ({...prev, objectives: v}) : null)} multiple /></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Interesses</p><SelectionChips options={OPTIONS.sports} value={currentUser?.interests} onChange={(v: any) => setCurrentUser(prev => prev ? ({...prev, interests: v}) : null)} multiple /></div>
                </div>
              </section>

              <section className="space-y-6">
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest border-b border-indigo-500/20 pb-2">Frequência</p>
                <div className="space-y-4">
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Música</p><SelectionChips options={OPTIONS.music} value={currentUser?.music} onChange={(v: any) => setCurrentUser(prev => prev ? ({...prev, music: v}) : null)} multiple /></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Vibe</p><SelectionChips options={OPTIONS.vibes} value={currentUser?.environment} onChange={(v: any) => setCurrentUser(prev => prev ? ({...prev, environment: v}) : null)} multiple /></div>
                </div>
              </section>

              <section className="space-y-6">
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest border-b border-indigo-500/20 pb-2">Manifesto</p>
                <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:outline-none transition-all italic leading-relaxed" value={currentUser?.bio} rows={6} onChange={(e) => setCurrentUser(prev => prev ? ({...prev, bio: e.target.value}) : null)} />
              </section>

              <Button fullWidth onClick={() => handleSaveProfile(true)}>Atualizar Identidade</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
