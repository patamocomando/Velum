
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Lock, Ghost, MessageCircle, Globe, Zap, 
  Eye, EyeOff, Edit3, Plus, X, LocateFixed, 
  Sparkles, LockKeyhole, Music, Smile, ShieldCheck, Compass,
  CheckCircle2, LogOut, Send, Unlock, Trash2, Camera
} from 'lucide-react';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { AppState, Objective, Gender, Profile, Message, Mood } from './types';
import { MOCK_PROFILES, TRAVEL_CITIES, OPTIONS } from './constants';
import { generateId, calculateDistance } from './utils';
import { Button, Input, Card, Badge, Header } from './components/UI';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSy_VELUM_REAL_KEY_HERE", 
  authDomain: "velum-noir.firebaseapp.com",
  projectId: "velum-noir",
  storageBucket: "velum-noir.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loginPhone, setLoginPhone] = useState(''); 
  const [loginRealName, setLoginRealName] = useState(''); 
  const [loginPassword, setLoginPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formProfile, setFormProfile] = useState<Partial<Profile>>({
    photos: [], vaultPhotos: [], seeking: [], objectives: [], bio: '', age: undefined, music: [], environment: [], interests: [],
    location: { lat: -7.1195, lng: -34.8450, city: 'João Pessoa', type: 'GPS' },
    mood: Mood.CONVERSA
  });
  
  const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getChatId = (id1: string, id2: string) => [id1, id2].sort().join('_');

  useEffect(() => {
    const initApp = async () => {
      const activeUid = localStorage.getItem('velum_active_uid');
      if (activeUid) {
        try {
          const userDoc = await getDoc(doc(db, "profiles", activeUid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as Profile);
            setCurrentPage(AppState.DISCOVER);
          }
        } catch (e) {
          console.error("Erro na sessão:", e);
        }
      }
      setIsLoading(false);
    };

    const unsubProfiles = onSnapshot(collection(db, "profiles"), (snapshot) => {
      const profiles: Profile[] = [];
      snapshot.forEach(doc => profiles.push(doc.data() as Profile));
      setAllProfiles(profiles.length > 0 ? profiles : MOCK_PROFILES);
    });

    initApp();
    return () => unsubProfiles();
  }, []);

  useEffect(() => {
    if (!currentUser || !selectedPartner || currentPage !== AppState.CHAT) return;
    const chatId = getChatId(currentUser.uid, selectedPartner.uid);
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach(doc => msgs.push(doc.data() as Message));
      setChatMessages(msgs);
    });
  }, [selectedPartner, currentUser, currentPage]);

  const handleAuth = async () => {
    if (!loginPhone || !loginPassword) return alert("Credenciais obrigatórias.");

    if (isSignupMode) {
      const q = query(collection(db, "profiles"), where("phone", "==", loginPhone));
      const checkSnapshot = await getDocs(q);
      if (!checkSnapshot.empty) return alert("Membro já cadastrado.");

      const newUid = generateId();
      setFormProfile(p => ({ ...p, uid: newUid, phone: loginPhone, name: loginRealName || 'Membro Noir' }));
      (window as any)._tempPass = loginPassword;
      setOnboardingStep(1);
      setCurrentPage(AppState.ONBOARDING);
    } else {
      const q = query(collection(db, "profiles"), where("phone", "==", loginPhone));
      const querySnapshot = await getDocs(q);
      let found = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.password === loginPassword) {
          setCurrentUser(data as Profile);
          localStorage.setItem('velum_active_uid', data.uid);
          setCurrentPage(AppState.DISCOVER);
          found = true;
        }
      });
      if (!found) alert("Acesso negado. Verifique telefone e senha.");
    }
  };

  const handleSaveProfile = async (isEdit: boolean, updatedData?: Partial<Profile>) => {
    const profileBase = isEdit ? currentUser : formProfile;
    if (!profileBase?.uid) return;

    const finalProfile = {
      ...profileBase,
      ...updatedData,
      password: isEdit ? (currentUser as any).password : (window as any)._tempPass,
      updatedAt: Date.now(),
      photos: profileBase.photos || [],
      seeking: profileBase.seeking || [],
      objectives: profileBase.objectives || []
    } as Profile;

    try {
      await setDoc(doc(db, "profiles", finalProfile.uid), finalProfile);
      setCurrentUser(finalProfile);
      if (isEdit) {
        setCurrentPage(AppState.PROFILE);
      } else {
        localStorage.setItem('velum_active_uid', finalProfile.uid);
        setCurrentPage(AppState.SIGNUP);
      }
    } catch (e) {
      alert("Erro ao sincronizar com o Firestore.");
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentUser || !selectedPartner) return;
    const chatId = getChatId(currentUser.uid, selectedPartner.uid);
    const msg: Message = { id: generateId(), senderId: currentUser.uid, text: messageInput.trim(), timestamp: Date.now() };
    await addDoc(collection(db, "chats", chatId, "messages"), msg);
    setMessageInput('');
  };

  const filteredProfiles = useMemo(() => {
    if (!currentUser) return [];
    let list = allProfiles.filter(p => p.uid !== currentUser.uid);
    if (currentUser.seeking?.length) list = list.filter(p => currentUser.seeking.includes(p.gender));
    return list.map(p => ({ ...p, distance: calculateDistance(currentUser.location, p.location) }))
               .sort((a, b) => (a.location.city === currentUser.location.city ? -1 : 1));
  }, [allProfiles, currentUser]);

  const SelectionChips = ({ options, value, onChange, multiple = false }: any) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt: string) => {
        const active = multiple ? value?.includes(opt) : value === opt;
        return (
          <button key={opt} onClick={() => {
            if (multiple) {
              const arr = Array.isArray(value) ? value : [];
              onChange(arr.includes(opt) ? arr.filter((x: any) => x !== opt) : [...arr, opt]);
            } else onChange(opt);
          }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{opt}</button>
        );
      })}
    </div>
  );

  const BottomNav = () => (
    <nav className="shrink-0 h-20 bg-[#070708]/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 z-[100] safe-area-bottom">
      {[{ id: AppState.DISCOVER, icon: Sparkles }, { id: AppState.CHAT_LIST, icon: MessageCircle }, { id: AppState.VAULT, icon: LockKeyhole }, { id: AppState.PROFILE, icon: User }].map((item) => (
        <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`p-3 transition-all ${currentPage === item.id ? 'text-indigo-500 scale-125' : 'text-gray-600'}`}>
          <item.icon size={22} />
        </button>
      ))}
    </nav>
  );

  if (isLoading) return <div className="h-full w-full bg-[#070708] flex items-center justify-center font-serif italic text-white animate-pulse">VELUM</div>;

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#070708] overflow-hidden relative">
      {currentPage === AppState.LANDING && (
        <div className="flex-1 flex flex-col justify-center items-center px-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200" className="w-full h-full object-cover" /></div>
          <h1 className="text-7xl font-serif italic text-white mb-2 relative z-10">VELUM</h1>
          <p className="text-gray-500 uppercase tracking-[0.5em] text-[9px] mb-12 font-black relative z-10">Noir Society</p>
          <div className="w-full space-y-3 relative z-10">
            {isSignupMode && <Input placeholder="Seu Nome Noir" value={loginRealName} onChange={e => setLoginRealName(e.target.value)} />}
            <Input type="tel" placeholder="Telefone (Login)" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="Chave Privada" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            <Button fullWidth onClick={handleAuth}>{isSignupMode ? 'Iniciar Iniciação' : 'Acessar o Véu'}</Button>
            <button onClick={() => setIsSignupMode(!isSignupMode)} className="mt-4 text-[10px] uppercase font-black text-gray-500 tracking-widest">{isSignupMode ? 'Já sou membro' : 'Solicitar Iniciação'}</button>
          </div>
        </div>
      )}

      {currentPage === AppState.ONBOARDING && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title={`Iniciação ${onboardingStep}/6`} />
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
            {onboardingStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right">
                <h2 className="text-2xl font-serif italic text-white">Sua Natureza</h2>
                <Input type="number" placeholder="Sua idade" value={formProfile.age || ''} onChange={e => setFormProfile({...formProfile, age: parseInt(e.target.value) || undefined})} />
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Gênero</p>
                <SelectionChips options={OPTIONS.genders} value={formProfile.gender} onChange={(v: any) => setFormProfile({...formProfile, gender: v})} />
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Buscando</p>
                <SelectionChips options={OPTIONS.genders} value={formProfile.seeking} onChange={(v: any) => setFormProfile({...formProfile, seeking: v})} multiple />
                <Button fullWidth onClick={() => setOnboardingStep(2)}>Próximo</Button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right">
                <h2 className="text-2xl font-serif italic text-white">Localização</h2>
                <button onClick={() => navigator.geolocation.getCurrentPosition(pos => setFormProfile({...formProfile, location: { lat: pos.coords.latitude, lng: pos.coords.longitude, city: 'Localizado', type: 'GPS' }}))} className="w-full p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-indigo-400 flex items-center justify-center gap-4"><LocateFixed size={24} /> Ativar GPS Noir</button>
                <div className="grid grid-cols-2 gap-2">{TRAVEL_CITIES.map(c => (<button key={c} onClick={() => setFormProfile({...formProfile, location: { ...formProfile.location!, city: c, type: 'MANUAL' }})} className={`px-4 py-3 rounded-xl text-[10px] border transition-all ${formProfile.location?.city === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{c}</button>))}</div>
                <Button fullWidth onClick={() => setOnboardingStep(3)}>Próximo</Button>
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right">
                <h2 className="text-2xl font-serif italic text-white">Seus Objetivos</h2>
                <SelectionChips options={Object.values(Objective)} value={formProfile.objectives} onChange={(v: any) => setFormProfile({...formProfile, objectives: v})} multiple />
                <Button fullWidth onClick={() => setOnboardingStep(4)}>Próximo</Button>
              </div>
            )}
            {onboardingStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right">
                <h2 className="text-2xl font-serif italic text-white">Sua Frequência</h2>
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Música</p>
                <SelectionChips options={OPTIONS.music} value={formProfile.music} onChange={(v: any) => setFormProfile({...formProfile, music: v})} multiple />
                <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">Interesses</p>
                <SelectionChips options={OPTIONS.sports} value={formProfile.interests} onChange={(v: any) => setFormProfile({...formProfile, interests: v})} multiple />
                <Button fullWidth onClick={() => setOnboardingStep(5)}>Próximo</Button>
              </div>
            )}
            {onboardingStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right">
                <h2 className="text-2xl font-serif italic text-white">Seu Manifesto</h2>
                <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:outline-none italic leading-relaxed" placeholder="Como você se descreve?" value={formProfile.bio} rows={6} onChange={(e) => setFormProfile({...formProfile, bio: e.target.value})} />
                <Button fullWidth onClick={() => setOnboardingStep(6)}>Próximo</Button>
              </div>
            )}
            {onboardingStep === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right">
                <h2 className="text-2xl font-serif italic text-white">Sua Galeria</h2>
                <input type="file" hidden ref={fileInputRef} onChange={(e) => { const r = new FileReader(); r.onload = (ev) => setFormProfile({...formProfile, photos: [...(formProfile.photos || []), ev.target?.result as string]}); r.readAsDataURL(e.target.files![0]); }} accept="image/*" />
                <div className="grid grid-cols-2 gap-4">
                  {(formProfile.photos || []).map((p, i) => (<div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden relative shadow-lg"><img src={p} className="w-full h-full object-cover" /><button onClick={() => setFormProfile({...formProfile, photos: formProfile.photos?.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white"><X size={14}/></button></div>))}
                  {(formProfile.photos?.length || 0) < 3 && <button onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5"><Camera size={32} /></button>}
                </div>
                <Button fullWidth onClick={() => handleSaveProfile(false)}>Concluir Iniciação</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentPage === AppState.SIGNUP && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-12 animate-in fade-in">
          <ShieldCheck size={80} className="text-indigo-500 animate-pulse" />
          <h3 className="text-4xl font-serif italic text-white">Pacto de Silêncio</h3>
          <p className="text-xs text-gray-500 italic">"O que acontece no Véu, permanece no Véu."</p>
          <Button fullWidth onClick={() => setCurrentPage(AppState.DISCOVER)}>Entrar na Sociedade</Button>
        </div>
      )}

      {currentPage === AppState.DISCOVER && (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          <Header title={currentUser?.location?.city || 'Velum'} rightElement={<button onClick={() => setIsTravelModeOpen(true)} className="p-3 bg-white/5 rounded-2xl text-indigo-400 border border-white/10"><Globe size={20}/></button>} />
          <div className="flex-1 flex flex-col px-6 overflow-hidden relative">
            {filteredProfiles[currentIndex] ? (
              <div className="flex-1 flex flex-col relative min-h-0">
                <Card className="flex-1 border-none relative group overflow-hidden mb-6">
                  <img src={filteredProfiles[currentIndex].photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-90" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-3xl font-serif italic text-white">{filteredProfiles[currentIndex].name}, {filteredProfiles[currentIndex].age}</h2>
                       <Badge active>Membro Real</Badge>
                    </div>
                    <p className="text-gray-300 text-sm italic opacity-80 line-clamp-2">"{filteredProfiles[currentIndex].bio}"</p>
                  </div>
                </Card>
                <div className="shrink-0 flex justify-center items-center gap-6 py-4">
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="w-14 h-14 bg-[#0d0d0f] border border-white/10 rounded-full flex items-center justify-center text-red-500"><X size={24} /></button>
                  <button onClick={() => { setSelectedPartner(filteredProfiles[currentIndex]); setCurrentPage(AppState.CHAT); }} className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl"><MessageCircle size={36} fill="white"/></button>
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="w-14 h-14 bg-[#0d0d0f] border border-white/10 rounded-full flex items-center justify-center text-yellow-400"><Zap size={22} fill="currentColor"/></button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center animate-in fade-in">
                <Ghost size={80} className="mb-6 text-indigo-500" />
                <h3 className="text-2xl font-serif italic text-white">Ninguém por perto</h3>
                <Button variant="outline" className="mt-10" onClick={() => setCurrentIndex(0)}>Recarregar Radar</Button>
              </div>
            )}
          </div>
          <BottomNav />
        </div>
      )}

      {currentPage === AppState.CHAT && selectedPartner && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title={selectedPartner.name} onBack={() => setCurrentPage(AppState.DISCOVER)} />
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col no-scrollbar bg-[#09090b]">
             {chatMessages.map((msg) => (
               <div key={msg.id} className={`max-w-[85%] p-4 rounded-2xl text-sm italic ${msg.senderId === currentUser?.uid ? 'self-end bg-indigo-600 text-white shadow-lg' : 'self-start bg-white/[0.05] border border-white/5 text-gray-200'}`}>
                 {msg.text}
               </div>
             ))}
             {chatMessages.length === 0 && <div className="flex-1 flex items-center justify-center text-gray-600 italic text-sm">Inicie um sussurro discreto...</div>}
          </div>
          <div className="p-6 bg-[#070708] border-t border-white/5 flex items-center gap-4 safe-area-bottom">
             <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Sussurrar..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none" />
             <button onClick={handleSendMessage} className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Send size={20} /></button>
          </div>
        </div>
      )}

      {currentPage === AppState.PROFILE && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header title="Identidade Noir" />
          <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-10 no-scrollbar py-6">
            <div className="aspect-square w-full rounded-[3.5rem] overflow-hidden relative shadow-2xl">
              <img src={currentUser?.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800'} className="w-full h-full object-cover" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div><h2 className="text-3xl font-serif italic text-white">{currentUser?.name}</h2><Badge active>Membro Oficial</Badge></div>
                <button onClick={() => setCurrentPage(AppState.EDIT_PROFILE)} className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Edit3 size={20} /></button>
              </div>
            </div>
            <div className="flex gap-4 pb-12">
              <Button variant="outline" className="flex-1" onClick={() => { localStorage.removeItem('velum_active_uid'); setCurrentUser(null); setCurrentPage(AppState.LANDING); }}><LogOut size={18} /> Sair</Button>
              <Button variant="danger" className="flex-1" onClick={async () => { if(confirm("Excluir conta permanentemente?")) { await deleteDoc(doc(db, "profiles", currentUser!.uid)); localStorage.removeItem('velum_active_uid'); window.location.reload(); } }}><Trash2 size={18} /> Excluir</Button>
            </div>
          </div>
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default App;
