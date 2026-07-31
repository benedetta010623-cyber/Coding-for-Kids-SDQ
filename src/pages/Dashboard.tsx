import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../lib/utils';
import ProjectThumbnail from '../components/ProjectThumbnail';
import { motion } from 'motion/react';
import { LayoutDashboard, LogOut, Plus, Gamepad2, ImageIcon, FileText, Globe, Clock, CheckCircle, AlertCircle, Sparkles, RefreshCw, Sliders } from 'lucide-react';
import { 
  HAIR_OPTIONS, 
  HAIR_COLOR_OPTIONS, 
  EYE_OPTIONS, 
  MOUTH_OPTIONS, 
  ACCESSORY_OPTIONS, 
  CLOTHING_OPTIONS, 
  CLOTHING_COLOR_OPTIONS, 
  SKIN_OPTIONS, 
  getAvatarUrl, 
  buildCustomAvatarUrl, 
  parseAvatarUrl, 
  handleAvatarError,
  getStudentAvatarSrc
} from '../lib/avatar';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Visual Programming',
    imageUrl: '',
    link: '',
    type: 'scratch' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    avatarUrl: '',
    bio: '',
    name: '',
    class: ''
  });
  const [avatarOptions, setAvatarOptions] = useState<any>({
    seed: 'student',
    top: 'shortFlat',
    hairColor: '2c1b18',
    eyes: 'default',
    mouth: 'default',
    accessories: 'none',
    clothing: 'graphicShirt',
    clothingColor: '262e33',
    skinColor: 'ffdbb4'
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      const initialAvatarUrl = profile.avatarUrl || '';
      setEditProfileData({
        avatarUrl: initialAvatarUrl,
        bio: profile.bio || '',
        name: profile.name || '',
        class: profile.class || ''
      });

      // Parse initial avatar options
      if (initialAvatarUrl) {
        setAvatarOptions(parseAvatarUrl(initialAvatarUrl, profile.name, profile.gender));
      } else {
        const defaultOptions = {
          seed: encodeURIComponent((profile.name || 'student').trim() + '_' + (profile.gender || 'L')),
          top: profile.gender === 'P' ? 'straight01' : 'shortFlat',
          hairColor: '2c1b18',
          eyes: 'default',
          mouth: 'default',
          accessories: 'none',
          clothing: 'graphicShirt',
          clothingColor: '262e33',
          skinColor: 'ffdbb4'
        };
        setAvatarOptions(defaultOptions);
        const defaultUrl = buildCustomAvatarUrl(defaultOptions);
        setEditProfileData(prev => ({ ...prev, avatarUrl: defaultUrl }));
      }
    }
  }, [profile]);

  const handleAvatarOptionChange = (key: string, value: string) => {
    const updatedOptions = { ...avatarOptions, [key]: value };
    setAvatarOptions(updatedOptions);
    const newUrl = buildCustomAvatarUrl(updatedOptions);
    setEditProfileData(prev => ({ ...prev, avatarUrl: newUrl }));
  };

  const handleRandomizeAvatar = () => {
    const hairOpts = HAIR_OPTIONS.map(o => o.value);
    const hairColors = HAIR_COLOR_OPTIONS.map(o => o.value);
    const eyeOpts = EYE_OPTIONS.map(o => o.value);
    const mouthOpts = MOUTH_OPTIONS.map(o => o.value);
    const accOpts = ACCESSORY_OPTIONS.map(o => o.value);
    const clothOpts = CLOTHING_OPTIONS.map(o => o.value);
    const clothColors = CLOTHING_COLOR_OPTIONS.map(o => o.value);
    const skinColors = SKIN_OPTIONS.map(o => o.value);

    const randomVal = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    const randomized = {
      seed: Math.random().toString(36).substring(7),
      top: randomVal(hairOpts),
      hairColor: randomVal(hairColors),
      eyes: randomVal(eyeOpts),
      mouth: randomVal(mouthOpts),
      accessories: randomVal(accOpts),
      clothing: randomVal(clothOpts),
      clothingColor: randomVal(clothColors),
      skinColor: randomVal(skinColors)
    };

    setAvatarOptions(randomized);
    const newUrl = buildCustomAvatarUrl(randomized);
    setEditProfileData(prev => ({ ...prev, avatarUrl: newUrl }));
  };

  const handleResetToGenderDefault = () => {
    if (!profile) return;
    const defaultOptions = {
      seed: encodeURIComponent((profile.name || 'student').trim() + '_' + (profile.gender || 'L')),
      top: profile.gender === 'P' ? 'straight01' : 'shortFlat',
      hairColor: '2c1b18',
      eyes: 'default',
      mouth: 'default',
      accessories: 'none',
      clothing: 'graphicShirt',
      clothingColor: '262e33',
      skinColor: 'ffdbb4'
    };
    setAvatarOptions(defaultOptions);
    const newUrl = buildCustomAvatarUrl(defaultOptions);
    setEditProfileData(prev => ({ ...prev, avatarUrl: newUrl }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'students', user.uid), editProfileData);
      setIsEditingProfile(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'students');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'projects'),
        where('studentId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
      }, (error) => {
        console.error("Error fetching projects:", error);
      });

      return unsubscribe;
    }
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        imageUrl: formatImageUrl(newProject.imageUrl),
        studentId: user.uid,
        studentName: profile.name,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewProject({
        title: '',
        description: '',
        category: 'Visual Programming',
        imageUrl: '',
        link: '',
        type: 'scratch'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">MEMUAT...</div>;
  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436]">
      {/* Header */}
      <nav className="bg-white border-b-4 border-black p-6 flex justify-between items-center shadow-[0_4px_0_#FFD93D]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#FFD93D] border-2 border-black rounded-xl flex items-center justify-center font-black">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-['Fredoka_One'] text-xl uppercase leading-none">Dashboard Siswa</h1>
            <p className="text-xs font-black italic text-gray-500">Halo, {profile.name}! 👋</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-[#FF6B6B] text-white px-6 py-2 rounded-xl border-2 border-black font-black text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        >
          <LogOut size={16} /> KELUAR
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-10">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="col-span-2 bg-[#FFE66D] border-4 border-black p-8 rounded-[2.5rem] shadow-[12px_12px_0px_#FF8C32]">
            <h2 className="font-['Fredoka_One'] text-3xl mb-4">Ayo Upload Karyamu! 🚀</h2>
            <p className="font-black text-lg leading-relaxed mb-6">
              Sudah menyelesaikan project Scratch atau Gambar baru? Tunjukkan pada dunia! Guru akan mereview karyamu sebelum tampil di showcase.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-white text-black px-10 py-4 rounded-2xl border-4 border-black font-black text-xl shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
            >
              <Plus size={24} /> TAMBAH KARYA BARU
            </button>
          </div>
          
          <div className="bg-[#4ECDC4] border-4 border-black p-8 rounded-[2.5rem] shadow-[12px_12px_0px_black] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white border-4 border-black rounded-full overflow-hidden mb-4 shadow-[4px_4px_0px_black] relative group">
               <img 
                 src={getStudentAvatarSrc(profile)} 
                 alt={profile.name} 
                 onError={(e) => handleAvatarError(e, profile.name, profile.gender)}
                 referrerPolicy="no-referrer"
                 loading="lazy"
                 decoding="async"
                 className="w-full h-full object-cover" 
               />
               <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Plus size={20} />
               </button>
            </div>
            <h3 className="font-['Fredoka_One'] text-xl uppercase mb-1">{profile.name}</h3>
            <span className="bg-white border-2 border-black px-4 py-1 rounded-full font-black text-xs uppercase mb-4">KELAS {profile.class}</span>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="bg-white border-2 border-black px-4 py-1 rounded-lg font-black text-[10px] uppercase shadow-[2px_2px_0px_black] hover:shadow-none transition-all"
            >
              EDIT PROFIL
            </button>
          </div>
        </div>

        {/* Modal Edit Profile */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-4 border-black w-full max-w-4xl rounded-[3rem] shadow-[16px_16px_0px_black] p-6 md:p-10 max-h-[95vh] overflow-y-auto relative my-8"
            >
              <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFD93D] p-2 border-2 border-black rounded-xl">
                    <Sparkles className="text-black" size={24} />
                  </div>
                  <h3 className="font-['Fredoka_One'] text-2xl uppercase">Edit Profil & Avatar</h3>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(false)} 
                  className="bg-[#FF6B6B] text-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_black] hover:shadow-none transition-all"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Interactive Avatar Editor */}
                  <div className="lg:col-span-7 bg-[#FFF9F2] border-4 border-black p-6 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3">
                      <Sliders className="text-[#FF8C32]" size={20} />
                      <h4 className="font-['Fredoka_One'] text-lg uppercase">Kustomisasi Avatar 🎨</h4>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-white border-2 border-black p-4 rounded-2xl">
                      <div className="w-28 h-28 bg-[#FFE66D] border-4 border-black rounded-full overflow-hidden shadow-[4px_4px_0px_black] flex-shrink-0 relative">
                        <img 
                          src={editProfileData.avatarUrl || getAvatarUrl(profile.name, profile.gender || 'L')} 
                          alt="Pratinjau Avatar" 
                          onError={(e) => handleAvatarError(e, profile.name, profile.gender)}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="space-y-3 text-center sm:text-left w-full">
                        <p className="font-black text-sm uppercase">Coba gaya yang unik!</p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={handleRandomizeAvatar}
                            className="bg-[#FFD93D] border-2 border-black px-4 py-2 rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1"
                          >
                            Acak Avatar 🎲
                          </button>
                          <button
                            type="button"
                            onClick={handleResetToGenderDefault}
                            className="bg-gray-100 border-2 border-black px-4 py-2 rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1"
                          >
                            Reset 👤
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selector Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">💇‍♂️ Gaya Rambut</label>
                        <select
                          value={avatarOptions.top || 'shortFlat'}
                          onChange={e => handleAvatarOptionChange('top', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {HAIR_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">🎨 Warna Rambut</label>
                        <select
                          value={avatarOptions.hairColor || '2c1b18'}
                          onChange={e => handleAvatarOptionChange('hairColor', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {HAIR_COLOR_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">👀 Ekspresi Mata</label>
                        <select
                          value={avatarOptions.eyes || 'default'}
                          onChange={e => handleAvatarOptionChange('eyes', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {EYE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">👄 Ekspresi Mulut</label>
                        <select
                          value={avatarOptions.mouth || 'default'}
                          onChange={e => handleAvatarOptionChange('mouth', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {MOUTH_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">👓 Kacamata / Aksesoris</label>
                        <select
                          value={avatarOptions.accessories || 'blank'}
                          onChange={e => handleAvatarOptionChange('accessories', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {ACCESSORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">👕 Gaya Baju</label>
                        <select
                          value={avatarOptions.clothing || 'graphicShirt'}
                          onChange={e => handleAvatarOptionChange('clothing', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {CLOTHING_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">🧣 Warna Baju</label>
                        <select
                          value={avatarOptions.clothingColor || '262e33'}
                          onChange={e => handleAvatarOptionChange('clothingColor', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {CLOTHING_COLOR_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-black text-xs uppercase pl-1 text-gray-700">🧑🏽 Warna Kulit</label>
                        <select
                          value={avatarOptions.skinColor || 'ffdbb4'}
                          onChange={e => handleAvatarOptionChange('skinColor', e.target.value)}
                          className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs shadow-[2px_2px_0px_black] focus:shadow-none transition-all outline-none cursor-pointer"
                        >
                          {SKIN_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bio and Settings */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-black text-sm uppercase pl-2">Bio Singkat Kamu ✍️</label>
                        <textarea 
                          value={editProfileData.bio}
                          onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})}
                          placeholder="Ceritakan tentang dirimu atau cita-citamu..."
                          className="w-full bg-[#F3F4F6] border-2 border-black p-4 rounded-xl font-black text-sm h-32 outline-none focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-black text-xs uppercase pl-2 text-gray-400">Link Foto Avatar (Manual)</label>
                        <input 
                          type="url" required
                          value={editProfileData.avatarUrl}
                          onChange={e => setEditProfileData({...editProfileData, avatarUrl: e.target.value})}
                          placeholder="https://api.dicebear.com/..."
                          className="w-full bg-[#F3F4F6] border-2 border-black p-3 rounded-xl font-semibold text-xs text-gray-500 outline-none"
                        />
                        <p className="text-[10px] font-bold text-gray-400 italic">Link ini otomatis terupdate saat kamu memilih kustomisasi di sebelah kiri.</p>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#4ECDC4] text-white py-4 rounded-2xl border-4 border-black font-black text-xl shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                      >
                        {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PROFIL ✨'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="w-full bg-white text-black py-3 rounded-2xl border-2 border-black font-black text-sm hover:bg-gray-100 transition-all"
                      >
                        BATAL
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal / Form */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-4 border-black w-full max-w-2xl rounded-[3rem] shadow-[16px_16px_0px_black] p-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-['Fredoka_One'] text-3xl uppercase">Form Tambah Karya</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="bg-[#FF6B6B] text-white p-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-none translate-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-black text-sm uppercase tracking-widest pl-2">Judul Karya</label>
                    <input 
                      type="text" required
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Contoh: Game Petualangan Kucing"
                      className="w-full bg-[#F3F4F6] border-2 border-black p-4 rounded-2xl font-black outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-black text-sm uppercase tracking-widest pl-2">Kategori Kurikulum</label>
                    <select 
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                      className="w-full bg-[#F3F4F6] border-2 border-black p-4 rounded-2xl font-black outline-none focus:bg-white"
                    >
                      <option>Visual Programming (Scratch)</option>
                      <option>Digital Art (MS Paint)</option>
                      <option>PowerPoint Presentation</option>
                      <option>Word Document</option>
                      <option>Creative Design</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-black text-sm uppercase tracking-widest pl-2">Deskripsi Singkat</label>
                  <textarea 
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Ceritakan tentang karyamu di sini..."
                    className="w-full bg-[#F3F4F6] border-2 border-black p-4 rounded-2xl font-black outline-none focus:bg-white h-32"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-black text-sm uppercase tracking-widest pl-2">Link Gambar/Thumbnail (Opsional)</label>
                    <input 
                      type="url"
                      value={newProject.imageUrl}
                      onChange={e => setNewProject({...newProject, imageUrl: e.target.value})}
                      placeholder="https://imgur.com/your-image.jpg"
                      className="w-full bg-[#F3F4F6] border-2 border-black p-4 rounded-2xl font-black outline-none focus:bg-white"
                    />
                    <span className="text-[10px] text-gray-500 font-bold block pl-2">Kosongkan jika tidak ada. Sistem akan otomatis menampilkan icon karya (Game/Dokumen/Gambar) sesuai tipe project.</span>
                  </div>
                  <div className="space-y-2">
                    <label className="font-black text-sm uppercase tracking-widest pl-2">Link Project (Scratch/GDrive)</label>
                    <input 
                      type="url"
                      value={newProject.link}
                      onChange={e => setNewProject({...newProject, link: e.target.value})}
                      placeholder="https://scratch.mit.edu/projects/..."
                      className="w-full bg-[#F3F4F6] border-2 border-black p-4 rounded-2xl font-black outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-black text-sm uppercase tracking-widest pl-2">Tipe Project</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'scratch', icon: <Gamepad2 size={16} />, label: 'Scratch' },
                      { id: 'image', icon: <ImageIcon size={16} />, label: 'Gambar' },
                      { id: 'document', icon: <FileText size={16} />, label: 'Dokumen' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewProject({...newProject, type: type.id as any})}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black font-black transition-all ${newProject.type === type.id ? 'bg-[#FFD93D] shadow-[3px_3px_0px_black]' : 'bg-[#F3F4F6] opacity-50'}`}
                      >
                        {type.icon} {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6BCB77] text-white py-5 rounded-2xl border-4 border-black font-black text-2xl shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'MENGIRIM...' : 'UNGGAH KARYA SEKARANG ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* My Projects List */}
        <div>
          <h3 className="font-['Fredoka_One'] text-2xl uppercase mb-8 flex items-center gap-4">
            <span className="w-3 h-8 bg-[#4ECDC4] border-2 border-black rounded-full" />
            Karyamu ({projects.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_#FFD93D] flex flex-col"
              >
                <div className="h-40 border-b-4 border-black relative">
                  <ProjectThumbnail
                    imageUrl={project.imageUrl}
                    title={project.title}
                    type={project.type}
                    category={project.category}
                    imgClassName="w-full h-full object-cover"
                    badge={
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase tracking-widest flex items-center gap-1 ${project.status === 'approved' ? 'bg-[#6BCB77] text-white' : 'bg-[#FFE66D]'}`}>
                        {project.status === 'approved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {project.status === 'approved' ? 'Disetujui' : 'Tertunda'}
                      </div>
                    }
                  />
                </div>
                <div className="p-6 flex-1">
                  <span className="text-xs font-black text-[#FF6B6B] uppercase tracking-widest">{project.category}</span>
                  <h4 className="font-['Fredoka_One'] text-xl mt-1 mb-3">{project.title}</h4>
                  <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="p-6 pt-0 mt-auto">
                   {project.status === 'pending' && (
                     <div className="bg-[#FFF4E6] border-2 border-black p-3 rounded-xl flex items-center gap-3 text-xs font-black italic text-[#FF8C32]">
                        <AlertCircle size={16} /> Menunggu persetujuan guru...
                     </div>
                   )}
                   {project.status === 'approved' && (
                     <a href={`/student/${user.uid}`} className="block w-full text-center bg-[#F3F4F6] border-2 border-black py-2 rounded-xl font-black text-xs hover:bg-white transition-colors">
                        LIHAT DI SHOWCASE 👁️
                     </a>
                   )}
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-black rounded-[3rem] opacity-30">
                <Globe size={64} className="mx-auto mb-4" />
                <p className="text-2xl font-black">Belum ada karya yang diunggah.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
