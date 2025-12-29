
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Heart, User, Lock, MapPin, Ghost, MessageCircle, Globe, Zap, 
  Eye, EyeOff, Navigation, Edit3, Plus, X, LocateFixed, Fingerprint, Camera, Trash2,
  // Fix: Added missing icons used in the BottomNav
  Sparkles, LockKeyhole
} from 'lucide-react';
import { AppState, Objective, Gender, Profile, Mood } from './types';
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
  const [loginUsername, setLoginUsername] = useState('');
  const [loginRealName, setLoginRealName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formProfile, setFormProfile] = useState<Partial<Profile>>({
    photos: [],
    seeking: [],
    objectives: [],
    bio: ''
  });
  
  // Discovery
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const activeUserId = localStorage.getItem('velum_active_uid');
    if (activeUserId) {
      const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
      const profile = allAccounts[activeUserId];
      if (profile) {
        setCurrentUser(profile);
        setCurrentPage(AppState.DISCOVER);
      }
    }
    setTimeout(() => setIsLoading(false), 1200);
  }, []);

  const handleAuth = () => {
    const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    if (isSignupMode) {
      if (!loginUsername || !loginPassword) return;
      if (allAccounts[loginUsername]) { alert("Codinome indisponível."); return; }
      setFormProfile(prev => ({ ...prev, name: loginRealName || loginUsername, username: loginUsername, uid: generateId() }));
      (window as any)._tempPass = loginPassword;
      setOnboardingStep(1);
      setCurrentPage(AppState.ONBOARDING);
    } else {
      const foundUser = Object.values(allAccounts).find((u: any) => 
        (u.username === loginPhone) && u.password === loginPassword
      ) as Profile;
      
      if (foundUser) {
        setCurrentUser(foundUser);
        if (rememberMe) localStorage.setItem('velum_active_uid', foundUser.uid);
        setCurrentPage(AppState.DISCOVER);
      } else if (loginPhone === 'alex' && loginPassword === '123') {
        setCurrentUser(MOCK_USER);
        setCurrentPage(AppState.DISCOVER);
      } else {
        alert("Credenciais inválidas.");
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
    } as Profile;

    const passwordToStore = isEdit ? (currentUser as any).password : (window as any)._tempPass;
    const allAccounts = JSON.parse(localStorage.getItem('velum_accounts') || '{}');
    allAccounts[finalProfile.uid] = { ...finalProfile, password: passwordToStore };
    localStorage.setItem('velum_accounts', JSON.stringify(allAccounts));
    
    setCurrentUser(finalProfile);
    if (rememberMe) localStorage.setItem('velum_active_uid', finalProfile.uid);
    isEdit ? setCurrentPage(AppState.PROFILE) : setCurrentPage(AppState.SIGNUP);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentPhotos = formProfile.photos || [];
    if (currentPhotos.length >= 3) { alert("Máximo de 3 fotos."); return; }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormProfile(prev => ({ ...prev, photos: [...(prev.photos || []), base64] }));
    };
    reader.readAsDataURL(files[0]);
  };

  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        if (currentUser) {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: 'João Pessoa', type: 'GPS' as const };
          setCurrentUser({ ...currentUser, location: newLoc });
          setIsTravelModeOpen(false);
        }
      }, () => alert("Ative o GPS para proximidade real."));
    }
  };

  const filteredProfiles = useMemo(() => {
    if (!currentUser) return [];
    let list = [...MOCK_PROFILES];
    if (currentUser.seeking?.length) list = list.filter(p => currentUser.seeking.includes(p.gender));
    list = list.filter(p => p.location.city === (currentUser.location.city || 'João Pessoa'));
    return list.map(p => ({ ...p, distance: calculateDistance(currentUser.location, p.location) }));
  }, [currentUser]);

  const BottomNav = () => (
    <div className="shrink-0 h-24 bg-[#070708]/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 z-50">
      {[
        { id: AppState.DISCOVER, icon: Sparkles },
        { id: AppState.CHAT_LIST, icon: MessageCircle },
        { id: AppState.VAULT, icon: LockKeyhole },
        { id: AppState.PROFILE, icon: User }
      ].map((item) => (
        <button 
          key={item.id}
          onClick={() => setCurrentPage(item.id)} 
          className={`p-4 transition-all ${currentPage === item.id ? 'text-indigo-500 scale-110' : 'text-gray-600'}`}
        >
          <item.icon size={26} />
        </button>
      ))}
    </div>
  );

  const SelectionChips = ({ options, value, onChange, multiple = false }: any) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt: string) => {
        const active = multiple ? value.includes(opt) : value === opt;
        return (
          <button
            key={opt}
            onClick={() => {
              if (multiple) {
                onChange(value.includes(opt) ? value.filter((x: any) => x !== opt) : [...value, opt]);
              } else onChange(opt);
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#070708] overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-[1000] bg-[#070708] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <h1 className="text-xl font-serif italic text-white animate-pulse">VELUM</h1>
        </div>
      )}

      {currentPage === AppState.LANDING && (
        <div className="flex-1 flex flex-col justify-center items-center px-10 relative">
          <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=100&w=1200" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 w-full text-center">
            <h1 className="text-7xl font-serif italic text-white mb-2">VELUM</h1>
            <p className="text-gray-500 uppercase tracking-[0.6em] text-[9px] mb-12">NOIR SOCIETY</p>
            <div className="space-y-3 mb-8">
              {isSignupMode && <Input placeholder="Nome Real" value={loginRealName} onChange={e => setLoginRealName(e.target.value)} />}
              <Input placeholder="Codinome" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Chave Privada" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>
            <Button fullWidth onClick={handleAuth}>{isSignupMode ? 'Próximo' : 'Entrar'}</Button>
            <button onClick={() => setIsSignupMode(!isSignupMode)} className="mt-8 text-[10px] uppercase font-black text-gray-500">{isSignupMode ? 'Voltar' : 'Solicitar Iniciação'}</button>
          </div>
        </div>
      )}

      {currentPage === AppState.ONBOARDING && (
        <div className="flex-1 flex flex-col h-full">
          <Header title={`Iniciação ${onboardingStep}/2`} />
          <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-10 no-scrollbar">
            {onboardingStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic">Seus Fundamentos</h2>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase text-indigo-500 font-bold">Eu sou</p>
                  <SelectionChips options={OPTIONS.genders} value={formProfile.gender} onChange={(v: any) => setFormProfile({...formProfile, gender: v})} />
                  <p className="text-[10px] uppercase text-indigo-500 font-bold">Procuro por</p>
                  <SelectionChips options={OPTIONS.genders} value={formProfile.seeking} onChange={(v: any) => setFormProfile({...formProfile, seeking: v})} multiple />
                </div>
                <Button fullWidth onClick={() => setOnboardingStep(2)}>Fotos (Máx 3)</Button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-serif italic">Galeria Real</h2>
                <input type="file" hidden ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />
                <div className="grid grid-cols-2 gap-4">
                  {(formProfile.photos || []).map((p, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                      <img src={p} className="w-full h-full object-cover" />
                      <button onClick={() => setFormProfile(prev => ({...prev, photos: prev.photos?.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 bg-black/60 p-1 rounded-full"><X size={14}/></button>
                    </div>
                  ))}
                  {(formProfile.photos?.length || 0) < 3 && (
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 bg-white/5">
                      <Plus size={32} />
                    </button>
                  )}
                </div>
                <Button fullWidth onClick={() => handleSaveProfile(false)}>Concluir</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentPage === AppState.SIGNUP && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-12 animate-in fade-in">
          <Fingerprint size={80} className="text-indigo-500 animate-pulse" />
          <h3 className="text-4xl font-serif italic">Pacto de Silêncio</h3>
          <p className="text-xs text-gray-500 leading-relaxed italic">"O que acontece no Véu, permanece no Véu."</p>
          <Button fullWidth onClick={() => setCurrentPage(AppState.DISCOVER)}>Aceito o Pacto</Button>
        </div>
      )}

      {currentPage === AppState.DISCOVER && (
        <div className="flex-1 flex flex-col h-full relative">
          <Header title={currentUser?.location?.city || 'Velum'} rightElement={
            <button onClick={() => setIsTravelModeOpen(true)} className="p-2 bg-white/5 rounded-xl text-indigo-400 border border-white/5"><Globe size={20}/></button>
          } />
          
          <div className="flex-1 px-6 pb-28 relative overflow-hidden flex flex-col">
            {filteredProfiles[currentIndex] ? (
              <div className="flex-1 relative mb-6">
                <Card className="h-full w-full border-none shadow-2xl relative">
                  <img src={filteredProfiles[currentIndex].photos[0]} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <h2 className="text-4xl font-serif italic mb-2">{filteredProfiles[currentIndex].name}, {filteredProfiles[currentIndex].age}</h2>
                    <div className="flex items-center gap-4">
                      <Badge active>{filteredProfiles[currentIndex].gender}</Badge>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{filteredProfiles[currentIndex].distance}KM</span>
                    </div>
                  </div>
                </Card>
                
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10">
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="w-16 h-16 bg-[#070708] border border-white/10 rounded-full flex items-center justify-center text-red-500 shadow-xl"><X size={28}/></button>
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl scale-110"><Heart size={36} fill="white"/></button>
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="w-16 h-16 bg-[#070708] border border-white/10 rounded-full flex items-center justify-center text-yellow-400 shadow-xl"><Zap size={24} fill="currentColor"/></button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <Ghost size={80} className="mb-4" />
                <p className="font-serif italic text-xl">Véu em descanso...</p>
                <Button variant="outline" className="mt-8" onClick={() => setCurrentIndex(0)}>Reiniciar</Button>
              </div>
            )}
          </div>
          <BottomNav />

          {isTravelModeOpen && (
            <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-3xl p-10 flex flex-col animate-in fade-in duration-300">
              <Header title="Itinerante" onBack={() => setIsTravelModeOpen(false)} />
              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar py-6">
                <button onClick={handleGPS} className="w-full p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-between">
                  <span className="font-serif italic text-xl text-indigo-300">Local Atual (GPS)</span>
                  <LocateFixed size={20} className="text-indigo-400" />
                </button>
                {TRAVEL_CITIES.map(city => (
                  <button key={city} onClick={() => { setCurrentUser({...currentUser!, location: {...currentUser!.location, city, type: 'MANUAL'}}); setIsTravelModeOpen(false); }} className="w-full p-6 rounded-3xl border border-white/5 bg-white/5 text-left">
                    <span className="font-serif italic text-xl text-gray-400">{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentPage === AppState.PROFILE && (
        <div className="flex-1 flex flex-col h-full">
          <Header title="Identidade" />
          <div className="flex-1 px-8 space-y-12">
            <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/5 relative">
              <img src={currentUser?.photos[0]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
              <div className="absolute bottom-8 left-8">
                <h2 className="text-3xl font-serif italic">{currentUser?.name}</h2>
                <Badge active>Membro Verificado</Badge>
              </div>
            </div>
            <Button variant="danger" fullWidth onClick={() => { localStorage.removeItem('velum_active_uid'); setCurrentUser(null); setCurrentPage(AppState.LANDING); }}>Sair do Véu</Button>
          </div>
          <BottomNav />
        </div>
      )}

      {(currentPage === AppState.VAULT || currentPage === AppState.CHAT_LIST) && (
        <div className="flex-1 flex flex-col h-full">
          <Header title={currentPage === AppState.VAULT ? "Vault" : "Sussurros"} />
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 px-12 text-center">
             {currentPage === AppState.VAULT ? <Lock size={100}/> : <MessageCircle size={100}/>}
             <h3 className="text-2xl font-serif italic mt-6">{currentPage === AppState.VAULT ? "Cofre Criptografado" : "O Silêncio Impera"}</h3>
          </div>
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default App;
