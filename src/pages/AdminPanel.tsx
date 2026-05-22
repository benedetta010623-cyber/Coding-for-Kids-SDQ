import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, orderBy, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Check, X, ExternalLink, Clock, User, BookOpen, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const { user, profile, loading } = useAuth();
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'curriculum' | 'gallery'>('projects');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    desc: '',
    semester: 1,
    duration: '4 Minggu',
    icon: 'Rocket',
    order: 1,
    status: 'active'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (!adminDoc.exists()) {
          console.log("Not an admin, redirecting...");
          navigate('/');
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      // Projects Subscribe
      const qProjects = query(collection(db, 'projects'), where('status', '==', 'pending'), orderBy('createdAt', 'asc'));
      const unsubProjects = onSnapshot(qProjects, (snapshot) => {
        setPendingProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Curriculum Subscribe
      const qCurriculum = query(collection(db, 'curriculum'), orderBy('order', 'asc'));
      const unsubCurriculum = onSnapshot(qCurriculum, (snapshot) => {
        setCurriculum(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Gallery Subscribe
      const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
      const unsubGallery = onSnapshot(qGallery, (snapshot) => {
        setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => { unsubProjects(); unsubCurriculum(); unsubGallery(); };
    }
  }, [isAdmin]);

  const handleApprove = async (projectId: string) => {
    try { await updateDoc(doc(db, 'projects', projectId), { status: 'approved' }); } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'projects'); }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'curriculum'), newModule);
      setIsAddingModule(false);
      setNewModule({ title: '', desc: '', semester: 1, duration: '4 Minggu', icon: 'Rocket', order: curriculum.length + 1, status: 'active' });
    } catch (error) { handleFirestoreError(error, OperationType.WRITE, 'curriculum'); }
  };

  const handleDeleteModule = async (id: string) => {
    try { 
      await deleteDoc(doc(db, 'curriculum', id)); 
    } catch (error) { 
      handleFirestoreError(error, OperationType.DELETE, 'curriculum'); 
    }
  };

  const toggleModuleStatus = async (id: string, current: string) => {
    try { 
      const newStatus = current === 'active' ? 'coming_soon' : 'active';
      await updateDoc(doc(db, 'curriculum', id), { status: newStatus }); 
    } catch (error) { 
      handleFirestoreError(error, OperationType.UPDATE, 'curriculum'); 
    }
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; } 
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          const base64ImageUrl = canvas.toDataURL('image/jpeg', 0.7);

          await addDoc(collection(db, 'gallery'), {
            imageUrl: base64ImageUrl,
            title: file.name,
            createdAt: Date.now()
          });
          setIsUploadingGallery(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || isChecking) return <div className="min-h-screen flex items-center justify-center font-black">MEMERIKSA AKSES ADMIN...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436]">
      <nav className="bg-[#2D3436] text-white p-6 flex justify-between items-center border-b-4 border-black">
        <div className="flex items-center gap-4">
          <div className="bg-[#4ECDC4] p-2 rounded-xl border-2 border-black">
            <ShieldCheck size={24} className="text-black" />
          </div>
          <h1 className="font-['Fredoka_One'] text-2xl uppercase">Admin Panel</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setActiveTab('projects')}
             className={`px-4 py-2 rounded-xl font-black text-xs border-2 border-black transition-all ${activeTab === 'projects' ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_black]' : 'text-white'}`}
           >
             PROJECTS ({pendingProjects.length})
           </button>
           <button 
             onClick={() => setActiveTab('curriculum')}
             className={`px-4 py-2 rounded-xl font-black text-xs border-2 border-black transition-all ${activeTab === 'curriculum' ? 'bg-[#4ECDC4] text-black shadow-[4px_4px_0px_black]' : 'text-white'}`}
           >
             KURIKULUM
           </button>
           <button 
             onClick={() => setActiveTab('gallery')}
             className={`px-4 py-2 rounded-xl font-black text-xs border-2 border-black transition-all ${activeTab === 'gallery' ? 'bg-[#FF8C32] text-black shadow-[4px_4px_0px_black]' : 'text-white'}`}
           >
             GALERI
           </button>
           <button onClick={() => navigate('/')} className="font-black text-sm uppercase opacity-70 hover:opacity-100 ml-4">Keluar</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-10">
        {activeTab === 'projects' ? (
          <div>
            <div className="mb-10 bg-white border-4 border-black p-8 rounded-[2rem] shadow-[12px_12px_0px_#4ECDC4]">
              <h2 className="font-['Fredoka_One'] text-2xl mb-2 uppercase">Antrian Persetujuan</h2>
              <p className="font-black text-gray-500 italic">Ada {pendingProjects.length} karya yang butuh persetujuan darimu.</p>
            </div>

            <div className="grid gap-8">
              {pendingProjects.map((project) => (
                <motion.div layout key={project.id} className="bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[8px_8px_0px_black] flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-64 h-40 bg-gray-100 border-4 border-black rounded-2xl overflow-hidden shrink-0">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-[#FFE66D] border-2 border-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><User size={10} /> {project.studentName}</span>
                       <span className="bg-[#F3F4F6] border-2 border-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{project.category}</span>
                    </div>
                    <h3 className="font-['Fredoka_One'] text-2xl mb-2">{project.title}</h3>
                    <p className="text-sm font-black text-gray-500 mb-6 italic">"{project.description}"</p>
                    <div className="flex flex-wrap gap-4">
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white border-4 border-black px-4 py-2 rounded-xl font-black text-xs shadow-[4px_4px_0px_black] hover:shadow-none transition-all"><ExternalLink size={14} /> CEK PROJECT</a>
                      <button 
                        type="button"
                        onClick={() => handleApprove(project.id)} 
                        className="flex items-center gap-2 bg-[#6BCB77] text-white border-4 border-black px-6 py-2 rounded-xl font-black text-xs shadow-[4px_4px_0px_black] hover:shadow-none transition-all"
                      >
                        <Check size={16} /> SETUJUI
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {pendingProjects.length === 0 && (
                <div className="text-center py-20 bg-white border-4 border-dashed border-black rounded-[3rem] opacity-30">
                   <Clock size={64} className="mx-auto mb-4" />
                   <p className="text-2xl font-black">Tidak ada antrian persetujuan.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'curriculum' ? (
          <div>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="font-['Fredoka_One'] text-3xl uppercase">Manajemen Kurikulum</h2>
                <p className="font-black text-gray-500 italic">Atur materi yang muncul di halaman depan.</p>
              </div>
              <button 
                onClick={() => setIsAddingModule(true)} 
                className="bg-[#4ECDC4] text-white p-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-sm"
              >
                <Plus size={20} /> TAMBAH MODUL
              </button>
            </div>

            <div className="space-y-6">
              {curriculum.map((module) => (
                <div key={module.id} className="bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0px_black] flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#F3F4F6] border-2 border-black rounded-2xl flex items-center justify-center font-black text-xl shrink-0">
                    {module.semester}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-['Fredoka_One'] text-xl">{module.title}</h4>
                    <p className="text-xs font-bold text-gray-400">Order: {module.order} | Durasi: {module.duration}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => toggleModuleStatus(module.id, module.status)}
                      className={`px-4 py-2 rounded-xl border-4 border-black font-black text-xs uppercase transition-all ${module.status === 'active' ? 'bg-[#6BCB77] text-white shadow-[4px_4px_0px_black]' : 'bg-gray-100 text-gray-400 shadow-[4px_4px_0px_black]'}`}
                    >
                      {module.status === 'active' ? 'AKTIF' : 'COMING SOON'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteModule(module.id)} 
                      className="p-3 bg-[#FF6B6B] text-white border-4 border-black rounded-xl shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isAddingModule && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-10 rounded-[3rem] shadow-[16px_16px_0px_black] w-full max-w-lg">
                  <h3 className="font-['Fredoka_One'] text-2xl uppercase mb-8">Tambah Modul Baru</h3>
                  <form onSubmit={handleAddModule} className="space-y-4">
                    <input type="text" placeholder="Judul Modul" required className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} />
                    <textarea placeholder="Deskripsi Singkat" required className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold h-24" value={newModule.desc} onChange={e => setNewModule({...newModule, desc: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" placeholder="Semester" className="p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" value={newModule.semester} onChange={e => setNewModule({...newModule, semester: parseInt(e.target.value)})} />
                       <input type="number" placeholder="Order (Urutan)" className="p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" value={newModule.order} onChange={e => setNewModule({...newModule, order: parseInt(e.target.value)})} />
                    </div>
                    <button type="submit" className="w-full bg-[#4ECDC4] text-white py-4 rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_black] hover:shadow-none transition-all">SIMPAN MODUL ✨</button>
                    <button type="button" onClick={() => setIsAddingModule(false)} className="w-full font-black text-xs uppercase text-gray-400">Batalkan</button>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        ) : activeTab === 'gallery' ? (
          <div>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="font-['Fredoka_One'] text-3xl uppercase">Galeri Foto</h2>
                <p className="font-black text-gray-500 italic">Kelola foto-foto walimurid di halaman Galeri.</p>
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleAddGalleryImage} 
                  className="hidden" 
                  id="gallery-upload"
                  disabled={isUploadingGallery}
                />
                <label 
                  htmlFor="gallery-upload" 
                  className={`bg-[#FF8C32] text-white p-4 rounded-xl border-4 border-black flex items-center gap-2 font-black uppercase text-sm cursor-pointer transition-all ${isUploadingGallery ? 'opacity-50 cursor-not-allowed' : 'shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1'}`}
                >
                  {isUploadingGallery ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                  {isUploadingGallery ? 'MENGUPLOAD...' : 'TAMBAH FOTO'}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {gallery.map(image => (
                <div key={image.id} className="relative aspect-square bg-gray-100 rounded-3xl border-4 border-black overflow-hidden group">
                  <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleDeleteGalleryImage(image.id)}
                      className="bg-[#FF6B6B] text-white p-3 rounded-xl border-2 border-black font-black flex justify-center items-center gap-2 shadow-[2px_2px_0px_black] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                    >
                      <Trash2 size={16} /> HAPUS
                    </button>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white border-4 border-dashed border-black rounded-[3rem] opacity-50">
                  <ImageIcon size={48} className="mx-auto mb-4" />
                  <p className="font-black text-xl">Belum ada foto yang diupload.</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
