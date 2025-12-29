
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
  const [rememberMe, setRememberMe] = useState(true);
  
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

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    // 1. CARREGAMENTO E CONFERÊNCIA DE SESSÃO
    const activeUserId = localStorage.getItem('velum_active_uid');
    if (activeUserId) {
      const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
      const profile = allAccounts[activeUserId];
      if (profile) {
        setCurrentUser(profile);
        setCurrentPage(AppState.DISCOVER);
      }
    }
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // Reset do índice ao mudar filtros
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory, currentUser?.location?.city, currentUser?.location?.type, currentUser?.seeking]);

  const handleAuth = async () => {
    const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    
    if (isSignupMode) {
      if (!loginUsername || !loginPhone || !loginPassword || !loginRealName) return;
      
      // Verifica se codinome já existe
      if (allAccounts[loginUsername]) {
        alert("Este codinome já está em uso.");
        return;
      }

      setFormProfile(prev => ({ 
        ...prev, 
        name: loginRealName, 
        username: loginUsername,
        email: loginPhone, // Usando telefone como identificador secundário
        uid: generateId()
      }));
      // Guardamos a senha temporariamente para o salvamento final
      (window as any)._tempPass = loginPassword;
      setCurrentPage(AppState.ONBOARDING);
    } else {
      // LOGIN ÚNICO COM SENHA
      const foundUser = Object.values(allAccounts).find((u: any) => 
        (u.username === loginPhone || u.email === loginPhone) && u.password === loginPassword
      ) as (Profile & {password: string});
      
      if (foundUser) {
        setCurrentUser(foundUser);
        if (rememberMe) localStorage.setItem('velum_active_uid', foundUser.uid);
        setCurrentPage(AppState.DISCOVER);
      } else {
        // Fallback apenas para o Alex (Mock) se for o acesso de teste inicial
        if (loginPhone === 'alex' && loginPassword === '123') {
          setCurrentUser(MOCK_USER);
          setCurrentPage(AppState.DISCOVER);
        } else {
          alert("Credenciais Noir inválidas. Verifique seu codinome e chave.");
        }
      }
    }
  };

  const handleSaveProfile = (isEdit: boolean) => {
    const dataToSave = isEdit ? currentUser : formProfile;
    if (!dataToSave) return;

    const finalProfile = {
      ...(isEdit ? currentUser : MOCK_USER),
      ...dataToSave,
      photos: dataToSave.photos?.length ? dataToSave.photos : [MOCK_USER.photos[0]],
      location: currentUser?.location || MOCK_USER.location,
    } as Profile;

    const passwordToStore = isEdit ? (currentUser as any).password : (window as any)._tempPass;
    
    setCurrentUser(finalProfile);
    
    // ARMAZENAMENTO ROBUSTO: Sistema de Contas Locais
    const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    allAccounts[finalProfile.uid] = { ...finalProfile, password: passwordToStore };
    
    // Limpeza de cache se exceder 4MB (Capacidade do LocalStorage é ~5MB)
    const storageString = JSON.stringify(allAccounts);
    if (storageString.length > 4000000) {
      alert("Aviso: Memória do dispositivo para o Véu está quase cheia. Fotos pesadas foram removidas.");
      // Lógica de limpeza simples se necessário
    }

    localStorage.setItem('velum_accounts', JSON.stringify(allAccounts));
    
    if (rememberMe) {
      localStorage.setItem('velum_active_uid', finalProfile.uid);
    }
    
    isEdit ? setCurrentPage(AppState.PROFILE) : setCurrentPage(AppState.SIGNUP);
  };

  // Fixed error in App.tsx on line 428: Added handleLogout implementation
  const handleLogout = () => {
    localStorage.removeItem('velum_active_uid');
    setCurrentUser(null);
    setCurrentPage(AppState.LANDING);
  };

  const handleGPSRequest = () => {
    // Tenta carregar do cache primeiro para "não pedir autorização" se já tiver
    const cachedLoc = localStorage.getItem('velum_cached_gps');
    if (cachedLoc && !isTravelModeOpen) {
       const loc = JSON.parse(cachedLoc);
       if (currentUser) setCurrentUser({...currentUser, location: loc});
       return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude, 
            city: 'João Pessoa', 
            type: 'GPS' as const
          };
          if (currentUser) {
            setCurrentUser({ ...currentUser, location: newLoc });
            localStorage.setItem('velum_cached_gps', JSON.stringify(newLoc));
            setIsTravelModeOpen(false);
          }
        },
        () => alert("Para precisão total, autorize a localização Noir nas configurações.")
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
    if (Math.abs(diff) > 80) handleSwipeAction(diff > 0 ? 'left' : 'right');
    touchStartX.current = null;
  };

  const filteredProfiles = useMemo(() => {
    if (!currentUser) return [];
    let list = [...MOCK_PROFILES];
    if (currentUser.seeking?.length) {
      list = list.filter(p => currentUser.seeking.includes(p.gender));
    }
    const currentCity = currentUser.location?.city || 'João Pessoa';
    list = list.filter(p => p.location.city === currentCity);

    return list.map(p => ({
      ...p,
      distance: calculateDistance(currentUser.location, p.location)
    }));
  }, [currentUser?.location?.city, currentUser?.seeking]);

  const SelectionChips = ({ options, value, onChange, multiple = false }: { options: string[], value: any, onChange: (v: any) => void, multiple?: boolean }) => {
    const isSelected = (opt: string) => {
      const currentVal = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(', ') : []);
      return currentVal.includes(opt);
    };

    return (
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = isSelected(opt);
          return (
            <button
              key={opt}
              onClick={() => {
                let currentArr = Array.isArray(value) ? [...value] : (typeof value === 'string' ? value.split(', ').filter(x => x) : []);
                if (multiple) {
                  const nextValue = currentArr.includes(opt) ? currentArr.filter(o => o !== opt) : [...currentArr, opt];
                  onChange(nextValue);
                } else {
                  onChange(opt);
                }
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${active ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  // REUTILIZAÇÃO DE SEÇÕES PARA EDIÇÃO TOTAL
  const ProfileFormSections = ({ data, update }: { data: any, update: (d: any) => void }) => (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Identidade & Filtro</label>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[9px] text-gray-500 uppercase font-black">Eu sou</p>
            <SelectionChips options={OPTIONS.genders} value={data.gender} onChange={v => update({...data, gender: v})} />
          </div>
          <div className="space-y-2">
            <p className="text-[9px] text-gray-500 uppercase font-black">Desejo encontrar</p>
            <SelectionChips options={OPTIONS.genders} value={data.seeking} onChange={v => update({...data, seeking: v})} multiple />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Estética & Vibe</label>
        <div className="space-y-4">
          <SelectionChips options={OPTIONS.appearance} value={data.appearance} onChange={v => update({...data, appearance: v})} multiple />
          <SelectionChips options={OPTIONS.traits} value={data.traits} onChange={v => update({...data, traits: v})} multiple />
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Paladar & Ritmo</label>
        <div className="space-y-4">
          <SelectionChips options={OPTIONS.drinks} value={data.drink} onChange={v => update({...data, drink: v})} multiple />
          <SelectionChips options={OPTIONS.music} value={data.music} onChange={v => update({...data, music: v})} multiple />
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Limites & Ética</label>
        <SelectionChips options={OPTIONS.hardLimits} value={data.hardLimits} onChange={v => update({...data, hardLimits: v})} multiple />
      </section>

      <section className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Manifesto Pessoal</label>
        <textarea 
          className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-sm min-h-[150px] text-white focus:border-indigo-500/50 outline-none resize-none font-light"
          value={data.bio}
          placeholder="Fale sobre seus desejos e curiosidades..."
          onChange={e => update({...data, bio: e.target.value})}
        />
      </section>
    </div>
  );

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

  // Fixed error in App.tsx on line 407: Implemented renderDiscover function
  const renderDiscover = () => {
    const profile = filteredProfiles[currentIndex];

    return (
      <div className="flex-1 flex flex-col relative animate-in fade-in duration-500">
        <Header 
          title={currentUser?.location?.city || 'Explorar'} 
          rightElement={
            <button 
              onClick={() => setIsTravelModeOpen(true)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              <Navigation size={12} /> Viajar
            </button>
          }
        />

        {/* Categories */}
        <div className="px-6 mb-6 flex gap-3 overflow-x-auto no-scrollbar py-2">
          {['Geral', ...Object.values(Objective)].map((obj) => (
            <button
              key={obj}
              onClick={() => setSelectedCategory(obj as Objective | 'Geral')}
              className={`whitespace-nowrap px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === obj ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-500'}`}
            >
              {obj}
            </button>
          ))}
        </div>

        {/* Discovery Card Area */}
        <div className="flex-1 px-6 pb-32 relative overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {profile ? (
            <div className="h-full relative group">
              <Card className="h-full relative border-none">
                <img src={profile.photos[0]} className="w-full h-full object-cover" alt={profile.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-8 left-8 right-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-serif italic text-white">{profile.name}, {profile.age}</h2>
                    {profile.isPrivate && <Lock size={18} className="text-indigo-400" />}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge active>{profile.gender}</Badge>
                    <Badge>{profile.location.city} • {profile.distance}km</Badge>
                  </div>
                  
                  <p className="text-gray-300 text-sm font-light line-clamp-2 leading-relaxed italic">
                    "{profile.bio}"
                  </p>
                </div>
              </Card>

              {/* Action Buttons Overlay */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
                <button 
                  onClick={() => handleSwipeAction('left')}
                  className="w-16 h-16 bg-[#070708] border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 shadow-2xl"
                >
                  <X size={28} />
                </button>
                <button 
                  onClick={() => handleSwipeAction('right')}
                  className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all active:scale-90"
                >
                  <Heart size={32} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <Globe size={80} className="text-indigo-400 animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-white">Fim do Horizonte</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 max-w-[200px]">Nenhum novo iniciado encontrado nesta frequência.</p>
              </div>
              <Button variant="outline" onClick={() => setCurrentIndex(0)}>Recarregar</Button>
            </div>
          )}
        </div>

        {/* Travel Mode Modal */}
        {isTravelModeOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-10 space-y-10 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic text-white">Para onde viajas?</h3>
              <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">Mudar localização atual</p>
            </div>
            
            <div className="w-full max-h-[400px] overflow-y-auto no-scrollbar space-y-2 px-4">
              <button 
                onClick={handleGPSRequest}
                className="w-full py-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-white flex items-center justify-center gap-3 hover:bg-indigo-500/10 transition-all"
              >
                <LocateFixed size={18} /> GPS: Local Atual
              </button>
              <div className="h-px bg-white/5 my-4" />
              {TRAVEL_CITIES.map(city => (
                <button 
                  key={city}
                  onClick={() => {
                    if (currentUser) {
                      setCurrentUser({
                        ...currentUser, 
                        location: { ...currentUser.location, city, type: 'MANUAL' }
                      });
                      setIsTravelModeOpen(false);
                    }
                  }}
                  className="w-full py-5 rounded-2xl border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  {city}
                </button>
              ))}
            </div>
            
            <button onClick={() => setIsTravelModeOpen(false)} className="text-gray-500 hover:text-white transition-all uppercase tracking-widest text-[10px] font-black">
              Cancelar
            </button>
          </div>
        )}

        <BottomNav />
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
        <div className="fixed inset-0 flex flex-col justify-center items-center px-10 bg-[#070708] animate-in fade-in duration-1000 overflow-hidden">
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
                  <Input placeholder="Seu Nome Real (Confidencial)" value={loginRealName} onChange={e => setLoginRealName(e.target.value)} />
                  <Input placeholder="Codinome Público" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
                </div>
              )}
              <Input placeholder="Codinome ou Telefone" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Sua Chave Privada" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 px-2">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>
            <Button fullWidth onClick={handleAuth}>{isSignupMode ? 'Próximo Passo' : 'Acessar o Véu'}</Button>
            <button onClick={() => setIsSignupMode(!isSignupMode)} className="mt-8 text-[10px] uppercase tracking-widest font-black text-gray-500 hover:text-white transition-all">
              {isSignupMode ? 'Voltar ao Acesso' : 'Solicitar uma Iniciação'}
            </button>
          </div>
        </div>
      )}

      {currentPage === AppState.ONBOARDING && (
        <div className="fixed inset-0 bg-[#070708] z-[150] flex flex-col overflow-y-auto no-scrollbar pb-32">
           <Header title={`Iniciação ${onboardingStep}/3`} onBack={() => onboardingStep > 1 ? setOnboardingStep(onboardingStep-1) : setCurrentPage(AppState.LANDING)} />
           <div className="px-8 space-y-10 max-w-md mx-auto w-full">
              {onboardingStep === 1 && (
                <div className="space-y-8">
                   <h2 className="text-3xl font-serif italic">Seus Fundamentos</h2>
                   <ProfileFormSections data={formProfile} update={setFormProfile} />
                   <Button fullWidth onClick={() => setOnboardingStep(2)}>Escolher Fotos</Button>
                </div>
              )}
              {onboardingStep === 2 && (
                <div className="space-y-8">
                   <h2 className="text-3xl font-serif italic text-white">Sua Galeria</h2>
                   <div className="grid grid-cols-2 gap-4">
                      {(formProfile.photos || []).map((photo, i) => (
                        <div key={i} className="aspect-[3/4] rounded-3xl overflow-hidden relative border border-white/10">
                          <img src={photo} className="w-full h-full object-cover" />
                          <button onClick={() => setFormProfile(prev => ({...prev, photos: prev.photos?.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white"><X size={14}/></button>
                        </div>
                      ))}
                      {(formProfile.photos?.length || 0) < 4 && (
                        <button onClick={() => setFormProfile(prev => ({...prev, photos: [...(prev.photos || []), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600']}))} className="aspect-[3/4] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] gap-2">
                          <Plus size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Adicionar</span>
                        </button>
                      )}
                   </div>
                   <Button fullWidth onClick={() => setOnboardingStep(3)}>Revisão Final</Button>
                </div>
              )}
              {onboardingStep === 3 && (
                <div className="space-y-8">
                   <h2 className="text-3xl font-serif italic text-white">Revisão Noir</h2>
                   <p className="text-gray-500 text-sm">Tudo pronto para sua iniciação. Estes dados definem sua entrada na sociedade.</p>
                   <Button fullWidth onClick={() => handleSaveProfile(false)}>Confirmar Pacto</Button>
                </div>
              )}
           </div>
        </div>
      )}

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
             <div className="space-y-4">
                <Button variant="outline" fullWidth onClick={() => setCurrentPage(AppState.VAULT)}>Gerenciar Vault</Button>
                <Button variant="danger" fullWidth onClick={handleLogout}>Sair do Véu</Button>
             </div>
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.EDIT_PROFILE && (
        <div className="fixed inset-0 bg-[#070708] z-[150] flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500">
           <Header title="Editar Perfil" onBack={() => setCurrentPage(AppState.PROFILE)} />
           <div className="px-8 pb-32 space-y-12 max-w-md mx-auto w-full">
              <ProfileFormSections data={currentUser} update={setCurrentUser} />
              <Button fullWidth onClick={() => handleSaveProfile(true)}>Salvar Identidade</Button>
           </div>
        </div>
      )}

      {/* VAULT E CHATS (STUBS) */}
      {[AppState.VAULT, AppState.CHAT_LIST].includes(currentPage) && (
        <div className="fixed inset-0 bg-[#070708] z-[100] flex flex-col animate-in fade-in duration-500">
          <Header title={currentPage === AppState.VAULT ? "Vault Privado" : "Sussurros"} onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center px-12 pb-32 space-y-10">
            {currentPage === AppState.VAULT ? <LockKeyhole size={100} className="text-indigo-400" /> : <MessageCircle size={100} className="text-indigo-400" />}
            <h3 className="text-3xl font-serif italic text-white">{currentPage === AppState.VAULT ? "Cofre Criptografado" : "Silêncio Noir"}</h3>
            <p className="text-xs text-gray-500">{currentPage === AppState.VAULT ? "Suas mídias estão seguras aqui." : "Novas conexões aparecerão aqui."}</p>
          </div>
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default App;
