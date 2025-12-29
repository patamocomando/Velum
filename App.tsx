
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Heart, User, Lock, MapPin, Ghost, Key, LockKeyhole,
  X, Check, MessageCircle, Globe, LogOut, Zap, 
  Eye, EyeOff, Phone, ChevronRight, Sparkles, Shield,
  Camera, CheckCircle2, Edit3, Sliders, Info, Trash2, Plus,
  Navigation, Send, Award, Coffee, BookOpen, Fingerprint, ChevronLeft, LocateFixed
} from 'lucide-react';
import { AppState, Objective, Gender, Profile, ChatSession, Mood, Message } from './types';
import { MOCK_USER, MOCK_PROFILES, TRAVEL_CITIES, MOCK_INTERESTS, OPTIONS } from './constants';
import { generateId, calculateDistance } from './utils';
import { Button, Input, Card, Badge, Header } from './components/UI';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Auth State
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginRealName, setLoginRealName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Onboarding Stage
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formProfile, setFormProfile] = useState<Partial<Profile>>({
    objectives: [],
    photos: [],
    vaultPhotos: [],
    interests: [],
    gender: undefined,
    seeking: [],
    bio: '',
    appearance: '',
    traits: '',
    drink: '',
    music: '',
    hardLimits: ''
  });
  
  // Discovery State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Objective | 'Geral'>('Geral');
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  const [zapEffect, setZapEffect] = useState(false);

  // Swipe logic
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    // Sistema de Auto-Login Único
    const activeUserId = localStorage.getItem('velum_active_uid');
    if (activeUserId) {
      const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
      const profile = allAccounts[activeUserId];
      if (profile) {
        setCurrentUser(profile);
        setCurrentPage(AppState.DISCOVER);
        setRememberMe(true);
      }
    }
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // Reset do índice ao mudar filtros ou região
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory, currentUser?.location?.city, currentUser?.location?.type, currentUser?.seeking]);

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 bg-[#070708]/95 backdrop-blur-2xl border-t border-white/5 px-10 flex items-center justify-between z-[80]">
      {[
        { id: AppState.DISCOVER, icon: Sparkles },
        { id: AppState.CHAT_LIST, icon: MessageCircle },
        { id: AppState.VAULT, icon: LockKeyhole },
        { id: AppState.PROFILE, icon: User }
      ].map((item) => (
        <button 
          key={item.id}
          onClick={() => setCurrentPage(item.id)} 
          className={`transition-all duration-300 ${currentPage === item.id ? 'text-indigo-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <item.icon size={24} strokeWidth={currentPage === item.id ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );

  const handleAuth = async () => {
    if (isSignupMode) {
      if (!loginUsername || !loginPhone || !loginPassword || !loginRealName) return;
      setFormProfile(prev => ({ ...prev, name: loginRealName, username: loginUsername }));
      setCurrentPage(AppState.ONBOARDING);
    } else {
      // Login Simulado: busca nos registros locais ou usa o mock
      const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
      const foundUser = Object.values(allAccounts).find((u: any) => u.email === loginPhone || u.username === loginPhone) as Profile;
      
      if (foundUser) {
        setCurrentUser(foundUser);
        if (rememberMe) localStorage.setItem('velum_active_uid', foundUser.uid);
        setCurrentPage(AppState.DISCOVER);
      } else {
        // Fallback para o Mock se for o acesso padrão
        setCurrentUser(MOCK_USER);
        setCurrentPage(AppState.DISCOVER);
      }
    }
  };

  const handleSaveProfile = (isEdit: boolean) => {
    const dataToSave = isEdit ? currentUser : formProfile;
    if (!dataToSave) return;

    const finalProfile = {
      ...(isEdit ? currentUser : MOCK_USER),
      ...dataToSave,
      uid: isEdit ? currentUser?.uid : generateId(),
      photos: dataToSave.photos?.length ? dataToSave.photos : [MOCK_USER.photos[0]],
      location: currentUser?.location || MOCK_USER.location,
    } as Profile;
    
    setCurrentUser(finalProfile);
    
    // Armazenamento em Sistema de Contas
    const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    allAccounts[finalProfile.uid] = finalProfile;
    localStorage.setItem('velum_accounts', JSON.stringify(allAccounts));
    
    if (rememberMe) {
      localStorage.setItem('velum_active_uid', finalProfile.uid);
    }
    
    isEdit ? setCurrentPage(AppState.PROFILE) : setCurrentPage(AppState.SIGNUP);
  };

  const handleGPSRequest = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (currentUser) {
            // Em um app real, aqui faríamos reverse geocoding para pegar a cidade
            // Simulamos que ele detectou João Pessoa para os cards aparecerem
            setCurrentUser({
              ...currentUser, 
              location: { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude, 
                city: 'João Pessoa', 
                type: 'GPS' 
              }
            });
            setIsTravelModeOpen(false);
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Por favor, habilite a localização nas configurações do seu navegador para usar o modo GPS.");
        }
      );
    }
  };

  const handleSwipeAction = (direction: 'left' | 'right') => {
    setCurrentIndex(prev => prev + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 80) {
      handleSwipeAction(diff > 0 ? 'left' : 'right');
    }
    touchStartX.current = null;
  };

  const filteredProfiles = useMemo(() => {
    if (!currentUser) return [];
    let list = [...MOCK_PROFILES];

    // Filtragem por Busca (Seeking)
    if (currentUser.seeking && currentUser.seeking.length > 0) {
      list = list.filter(p => currentUser.seeking.includes(p.gender));
    }

    // Filtragem por Objetivo
    if (selectedCategory !== 'Geral') {
      list = list.filter(p => p.objectives.includes(selectedCategory as Objective));
    }

    // Filtragem por Cidade
    const currentCity = currentUser.location?.city || 'João Pessoa';
    list = list.filter(p => p.location.city === currentCity);

    return list.map(p => ({
      ...p,
      distance: calculateDistance(currentUser.location, p.location)
    }));
  }, [selectedCategory, currentUser?.location?.city, currentUser?.location?.type, currentUser?.seeking]);

  const SelectionChips = ({ options, value, onChange, multiple = false }: { options: string[], value: any, onChange: (v: any) => void, multiple?: boolean }) => {
    const isSelected = (opt: string) => {
      if (multiple) {
        const currentArr = Array.isArray(value) ? value : (value?.split(', ') || []);
        return currentArr.includes(opt);
      }
      return value === opt;
    };

    return (
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = isSelected(opt);
          return (
            <button
              key={opt}
              onClick={() => {
                if (multiple) {
                  const currentArr = Array.isArray(value) ? [...value] : (value?.split(', ') || []).filter((x: string) => x);
                  const nextValue = currentArr.includes(opt) 
                    ? currentArr.filter((o: string) => o !== opt) 
                    : [...currentArr, opt];
                  onChange(nextValue);
                } else {
                  onChange(opt);
                }
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${active ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const renderOnboarding = () => {
    const totalSteps = 8;
    return (
      <div className="fixed inset-0 bg-[#070708] z-[150] flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-700">
        <Header 
          title={`Iniciação ${onboardingStep}/${totalSteps}`} 
          onBack={() => onboardingStep > 1 ? setOnboardingStep(onboardingStep - 1) : setCurrentPage(AppState.LANDING)} 
        />
        <div className="flex-1 px-8 pb-32 space-y-12 max-w-md mx-auto w-full">
          {onboardingStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-serif italic text-white">1. Identidade Noir</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Eu sou...</label>
                  <SelectionChips options={OPTIONS.genders} value={formProfile.gender} onChange={v => setFormProfile({...formProfile, gender: v as Gender})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Procuro por... (Múltiplo)</label>
                  <SelectionChips options={OPTIONS.genders} value={formProfile.seeking} onChange={v => setFormProfile({...formProfile, seeking: v as Gender[]})} multiple />
                </div>
              </div>
              <Button fullWidth onClick={() => setOnboardingStep(2)} disabled={!formProfile.gender || formProfile.seeking?.length === 0}>Próximo</Button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-serif italic text-white">2. Estética & Traços</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Aparência Predominante</label>
                  <SelectionChips options={OPTIONS.appearance} value={formProfile.appearance} onChange={v => setFormProfile({...formProfile, appearance: Array.isArray(v) ? v.join(', ') : v})} multiple />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Traços Marcantes</label>
                  <SelectionChips options={OPTIONS.traits} value={formProfile.traits} onChange={v => setFormProfile({...formProfile, traits: Array.isArray(v) ? v.join(', ') : v})} multiple />
                </div>
              </div>
              <Button fullWidth onClick={() => setOnboardingStep(3)}>Próximo</Button>
            </div>
          )}

          {onboardingStep >= 3 && onboardingStep <= 6 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-serif italic text-white">Personalização</h2>
              <p className="text-gray-500 text-sm">Passo {onboardingStep} de 8. Escolhas múltiplas ou pular.</p>
              <div className="space-y-6">
                {onboardingStep === 3 && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Bebidas</label>
                    <SelectionChips options={OPTIONS.drinks} value={formProfile.drink} onChange={v => setFormProfile({...formProfile, drink: Array.isArray(v) ? v.join(', ') : v})} multiple />
                  </div>
                )}
                {onboardingStep === 4 && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Música</label>
                    <SelectionChips options={OPTIONS.music} value={formProfile.music} onChange={v => setFormProfile({...formProfile, music: Array.isArray(v) ? v.join(', ') : v})} multiple />
                  </div>
                )}
                {onboardingStep === 5 && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Interesses</label>
                    <SelectionChips options={OPTIONS.sports} value={formProfile.interests} onChange={v => setFormProfile({...formProfile, interests: v})} multiple />
                  </div>
                )}
                {onboardingStep === 6 && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Hard Limits</label>
                    <SelectionChips options={OPTIONS.hardLimits} value={formProfile.hardLimits} onChange={v => setFormProfile({...formProfile, hardLimits: Array.isArray(v) ? v.join(', ') : v})} multiple />
                  </div>
                )}
              </div>
              <Button fullWidth onClick={() => setOnboardingStep(onboardingStep + 1)}>Próximo</Button>
            </div>
          )}

          {onboardingStep === 7 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-serif italic text-white">7. Galeria</h2>
              <div className="grid grid-cols-2 gap-4">
                {(formProfile.photos || []).map((photo, i) => (
                  <div key={i} className="aspect-[3/4] rounded-3xl overflow-hidden relative border border-white/10">
                    <img src={photo} className="w-full h-full object-cover" />
                    <button onClick={() => setFormProfile(prev => ({...prev, photos: prev.photos?.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white"><X size={14}/></button>
                  </div>
                ))}
                {(formProfile.photos?.length || 0) < 4 && (
                  <button onClick={() => {
                    const mock = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
                    setFormProfile(prev => ({...prev, photos: [...(prev.photos || []), mock]}));
                  }} className="aspect-[3/4] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] gap-2">
                    <Plus size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Adicionar</span>
                  </button>
                )}
              </div>
              <Button fullWidth onClick={() => setOnboardingStep(8)}>Próximo</Button>
            </div>
          )}

          {onboardingStep === 8 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-serif italic text-white">8. Bio Noir</h2>
              <textarea 
                placeholder="Seu manifesto... (Opcional)"
                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-sm min-h-[200px] text-white resize-none font-light"
                value={formProfile.bio}
                onChange={e => setFormProfile({...formProfile, bio: e.target.value})}
              />
              <Button fullWidth onClick={() => handleSaveProfile(false)}>Concluir Iniciação</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDiscover = () => {
    const profile = filteredProfiles[currentIndex];
    const isGPS = currentUser?.location?.type === 'GPS';
    
    return (
      <div className="fixed inset-0 flex flex-col bg-[#070708] max-w-md mx-auto overflow-hidden animate-in fade-in duration-500">
        <div className="shrink-0 z-30 pt-12 px-8 pb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-serif italic text-2xl text-white">VELUM</h1>
            <p className="text-[8px] uppercase tracking-[0.2em] text-indigo-500 font-black">Sociedade Curada</p>
          </div>
          <button 
            onClick={() => setIsTravelModeOpen(true)} 
            className={`w-12 h-12 flex items-center justify-center border rounded-2xl bg-white/5 transition-all shadow-lg ${isGPS ? 'border-indigo-500/50 text-indigo-400' : 'border-white/10 text-gray-400'}`}
          >
            <Globe size={20}/>
          </button>
        </div>

        {isTravelModeOpen && (
          <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col p-10 animate-in fade-in duration-300">
             <Header title="Itinerante" onBack={() => setIsTravelModeOpen(false)} />
             
             <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar py-6">
               <button 
                  onClick={handleGPSRequest}
                  className={`w-full p-6 rounded-[2rem] text-left border flex items-center justify-between transition-all group ${isGPS ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/[0.02] border-white/5'}`}
               >
                 <div className="flex flex-col">
                    <span className={`font-serif italic text-xl ${isGPS ? 'text-indigo-300' : 'text-gray-300'}`}>Localização Atual</span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">GPS Ativo</span>
                 </div>
                 <LocateFixed className={`${isGPS ? 'text-indigo-400' : 'text-gray-600'}`} size={20} />
               </button>

               <div className="py-4">
                  <p className="text-[9px] uppercase tracking-widest text-gray-600 font-black mb-4">Ou selecione um destino</p>
                  <div className="space-y-3">
                    {TRAVEL_CITIES.map(city => (
                      <button 
                        key={city} 
                        onClick={() => { 
                          if (currentUser) {
                            setCurrentUser({...currentUser, location: {...currentUser.location, city, type: 'MANUAL'}}); 
                            setIsTravelModeOpen(false); 
                          }
                        }} 
                        className={`w-full p-6 rounded-[2rem] text-left border transition-all ${!isGPS && currentUser?.location.city === city ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/5'}`}
                      >
                        <span className={`font-serif italic text-xl ${!isGPS && currentUser?.location.city === city ? 'text-indigo-300' : 'text-gray-400'}`}>{city}</span>
                      </button>
                    ))}
                  </div>
               </div>
             </div>
          </div>
        )}

        <div className="flex-1 relative px-6 flex flex-col mt-4 overflow-hidden">
          {profile ? (
            <div 
              key={profile.uid} 
              className="w-full h-full relative flex flex-col animate-in fade-in zoom-in duration-300 touch-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="flex-1 relative rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] bg-[#0d0d0f] mb-8 group">
                <img src={profile.photos?.[0] || MOCK_USER.photos[0]} className="w-full h-full object-cover brightness-[0.9]" alt={profile.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
                  <h3 className="text-4xl font-serif italic text-white mb-2 leading-none">{profile.name}, {profile.age}</h3>
                  <div className="flex items-center gap-2">
                     <MapPin size={10} className="text-indigo-500" />
                     <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{profile.location?.city} • {profile.distance}KM</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 opacity-20 text-center px-12 pb-20">
              <Ghost size={80} className="text-indigo-500 mb-8" />
              <h3 className="text-3xl font-serif italic text-white">Véu em Descanso</h3>
              <p className="text-xs text-gray-400 mt-2">Ninguém encontrado com essas preferências em {currentUser?.location.city || 'sua região'}.</p>
              <Button variant="outline" className="mt-8" onClick={() => setCurrentIndex(0)}>Reiniciar</Button>
            </div>
          )}
        </div>

        <div className="px-6 pb-32 flex justify-center items-center gap-8 z-40 relative mt-[-20px]">
          <button onClick={() => handleSwipeAction('left')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-red-500 shadow-xl">
            <X size={28} />
          </button>
          <button onClick={() => handleSwipeAction('right')} className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-110 shadow-[0_20px_40px_rgba(79,70,229,0.3)]">
            <Heart size={36} fill="white"/>
          </button>
          <button onClick={() => { setZapEffect(true); setTimeout(() => setZapEffect(false), 1500); handleSwipeAction('right'); }} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-yellow-400 shadow-xl">
            <Zap size={24} fill="currentColor"/>
          </button>
        </div>

        {zapEffect && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-indigo-950/20 backdrop-blur-[2px] pointer-events-none animate-in fade-in duration-300">
             <Zap size={120} className="text-white fill-current animate-bounce" />
          </div>
        )}
        <BottomNav />
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('velum_active_uid');
    setCurrentUser(null);
    setCurrentPage(AppState.LANDING);
    setLoginPhone('');
    setLoginPassword('');
    setIsSignupMode(false);
  };

  const renderEditProfile = () => {
    if (!currentUser) return null;
    return (
      <div className="fixed inset-0 bg-[#070708] z-[150] flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500">
        <Header title="Editar Identidade" onBack={() => setCurrentPage(AppState.PROFILE)} />
        <div className="flex-1 px-8 pb-32 space-y-12 max-w-md mx-auto w-full">
          <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
            
            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Essencial</label>
              <div className="space-y-4">
                <div className="space-y-2">
                   <p className="text-[9px] text-gray-500 uppercase font-black">Eu sou</p>
                   <SelectionChips options={OPTIONS.genders} value={currentUser.gender} onChange={v => setCurrentUser({...currentUser, gender: v as Gender})} />
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] text-gray-500 uppercase font-black">Procuro</p>
                   <SelectionChips options={OPTIONS.genders} value={currentUser.seeking} onChange={v => setCurrentUser({...currentUser, seeking: v as Gender[]})} multiple />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Estética & Traços</label>
              <div className="space-y-4">
                <SelectionChips options={OPTIONS.appearance} value={currentUser.appearance} onChange={v => setCurrentUser({...currentUser, appearance: Array.isArray(v) ? v.join(', ') : v})} multiple />
                <SelectionChips options={OPTIONS.traits} value={currentUser.traits} onChange={v => setCurrentUser({...currentUser, traits: Array.isArray(v) ? v.join(', ') : v})} multiple />
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Gosto & Estilo</label>
              <div className="space-y-4">
                <p className="text-[9px] text-gray-500 uppercase font-black">Paladar</p>
                <SelectionChips options={OPTIONS.drinks} value={currentUser.drink} onChange={v => setCurrentUser({...currentUser, drink: Array.isArray(v) ? v.join(', ') : v})} multiple />
                <p className="text-[9px] text-gray-500 uppercase font-black">Sussurros (Música)</p>
                <SelectionChips options={OPTIONS.music} value={currentUser.music} onChange={v => setCurrentUser({...currentUser, music: Array.isArray(v) ? v.join(', ') : v})} multiple />
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Limites Inegociáveis</label>
              <SelectionChips options={OPTIONS.hardLimits} value={currentUser.hardLimits} onChange={v => setCurrentUser({...currentUser, hardLimits: Array.isArray(v) ? v.join(', ') : v})} multiple />
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">O Manifesto</label>
              <textarea 
                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-sm min-h-[150px] text-white resize-none font-light"
                value={currentUser.bio}
                onChange={e => setCurrentUser({...currentUser, bio: e.target.value})}
              />
            </section>

            <Button fullWidth onClick={() => handleSaveProfile(true)}>Confirmar Todas Mudanças</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-[#070708] text-white min-h-screen relative font-sans overflow-hidden border-[1px] border-white/10 flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-[#070708] z-[999] flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <h1 className="text-2xl font-serif italic text-white tracking-widest animate-pulse">VELUM</h1>
        </div>
      )}

      {currentPage === AppState.LANDING && (
        <div className="fixed inset-0 flex flex-col justify-center items-center px-10 bg-[#070708] animate-in fade-in duration-1000">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=100&w=1200" className="w-full h-full object-cover brightness-[0.35]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[#070708]" />
          </div>
          <div className="relative z-10 w-full text-center">
            <h1 className="text-7xl font-serif italic text-white tracking-tighter mb-2">VELUM</h1>
            <p className="text-gray-400 uppercase tracking-[0.8em] text-[8px] font-black opacity-80 mb-14">NOIR SOCIETY</p>
            <div className="space-y-3 mb-8">
              {isSignupMode && (
                <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                  <Input placeholder="Nome Real" value={loginRealName} onChange={e => setLoginRealName(e.target.value)} />
                  <Input placeholder="Codinome" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
                </div>
              )}
              <Input placeholder="Codinome ou Telefone" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Sua Chave Privada" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
              <div className="flex items-center gap-3 mt-4 justify-center">
                <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600" id="remember" />
                <label htmlFor="remember" className="text-[10px] uppercase tracking-widest text-gray-500 font-black cursor-pointer">Lembrar minha Iniciação</label>
              </div>
            </div>
            <Button fullWidth onClick={handleAuth}>{isSignupMode ? 'Iniciar Iniciação' : 'Acessar o Véu'}</Button>
            <button onClick={() => setIsSignupMode(!isSignupMode)} className="mt-8 text-[10px] uppercase tracking-widest font-black text-gray-500 hover:text-white transition-all">
              {isSignupMode ? 'Já sou um iniciado' : 'Solicitar uma Iniciação'}
            </button>
          </div>
        </div>
      )}

      {currentPage === AppState.ONBOARDING && renderOnboarding()}
      {currentPage === AppState.SIGNUP && (
        <div className="fixed inset-0 bg-[#070708] z-[200] flex flex-col p-10 items-center justify-center text-center space-y-12 animate-in slide-in-from-bottom duration-1000">
          <Fingerprint size={80} className="text-indigo-500 animate-pulse" />
          <h3 className="text-4xl font-serif italic text-white">O Pacto de Silêncio</h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs text-left">
            I. O Segredo: O que acontece no véu, permanece no véu.<br/>
            II. O Consentimento: Não é não.<br/>
            III. A Verdade: Curadoria exige confiança mútua.
          </p>
          <Button fullWidth onClick={() => setCurrentPage(AppState.DISCOVER)}>Eu Aceito o Pacto</Button>
        </div>
      )}

      {currentPage === AppState.DISCOVER && renderDiscover()}

      {currentPage === AppState.PROFILE && (
        <div className="fixed inset-0 bg-[#070708] z-[100] flex flex-col animate-in slide-in-from-left duration-500 overflow-y-auto no-scrollbar pb-32">
          <Header title="Identidade" onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="px-8 space-y-12">
             <div className="w-full aspect-square rounded-[3.5rem] overflow-hidden border border-white/5 relative shadow-2xl group">
                <img src={currentUser?.photos?.[0] || MOCK_USER.photos[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-serif italic text-white leading-none">{currentUser?.name || 'Iniciado'}</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black mt-2">Membro Verificado</p>
                  </div>
                  <button onClick={() => setCurrentPage(AppState.EDIT_PROFILE)} className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Edit3 size={22} className="text-white"/>
                  </button>
                </div>
             </div>
             <Button variant="danger" fullWidth onClick={handleLogout}>Encerrar Sessão Noir</Button>
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.EDIT_PROFILE && renderEditProfile()}

      {currentPage === AppState.VAULT && (
        <div className="fixed inset-0 bg-[#070708] z-[100] flex flex-col animate-in fade-in duration-500">
          <Header title="Vault Privado" onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center px-12 pb-32 space-y-10">
            <LockKeyhole size={100} className="text-indigo-400" strokeWidth={1}/>
            <h3 className="text-3xl font-serif italic text-white">Cofre Criptografado</h3>
            <p className="text-xs text-gray-500">Suas mídias protegidas por criptografia de ponta a ponta.</p>
            <Button variant="outline" disabled className="opacity-50">Sincronizar Mídia</Button>
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.CHAT_LIST && (
        <div className="fixed inset-0 bg-[#070708] z-[100] flex flex-col animate-in slide-in-from-right duration-500">
          <Header title="Sussurros" onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20">
            <MessageCircle size={64} className="text-indigo-500" />
            <p className="italic font-serif text-xl">Aguardando a primeira conexão...</p>
          </div>
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default App;
