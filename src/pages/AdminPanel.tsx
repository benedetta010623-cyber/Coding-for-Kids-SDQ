import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, updateDoc, doc, onSnapshot, orderBy, addDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Check, X, ExternalLink, Clock, User, BookOpen, Plus, Trash2, Users, Key, Eye, EyeOff } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export default function AdminPanel() {
  const { user, profile, loading } = useAuth();
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'curriculum' | 'gallery' | 'students'>('projects');
  const [gallery, setGallery] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    class: '3A',
    password: 'codingkids123',
    bio: "Cita-citaku ingin menjadi programmer hebat!"
  });
  const [registerStatus, setRegisterStatus] = useState({ type: '', message: '' });
  const [revealPasswords, setRevealPasswords] = useState<{ [key: string]: boolean }>({});
  const [newGallery, setNewGallery] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
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

      // Students Subscribe
      const qStudents = query(collection(db, 'students'), orderBy('name', 'asc'));
      const unsubStudents = onSnapshot(qStudents, (snapshot) => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'students');
      });

      return () => { unsubProjects(); unsubCurriculum(); unsubGallery(); unsubStudents(); };
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

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newGallery,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
        likes: [],
        comments: []
      });
      setIsAddingGallery(false);
      setNewGallery({ title: '', description: '', imageUrl: '' });
    } catch (error) { handleFirestoreError(error, OperationType.WRITE, 'gallery'); }
  };

  const handleDeleteGallery = async (id: string) => {
    try { 
      await deleteDoc(doc(db, 'gallery', id)); 
    } catch (error) { 
      handleFirestoreError(error, OperationType.DELETE, 'gallery'); 
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.class.trim() || !newStudent.password.trim()) {
      setRegisterStatus({ type: 'error', message: 'Semua kolom bertanda bintang harus diisi!' });
      return;
    }
    if (newStudent.password.length < 6) {
      setRegisterStatus({ type: 'error', message: 'Password minimal harus 6 karakter!' });
      return;
    }

    setIsRegistering(true);
    setRegisterStatus({ type: '', message: '' });

    try {
      // Generate standard educational email from student name
      const studentEmail = `${newStudent.name.toLowerCase().trim().replace(/\s+/g, '.')}@sdq.id`;

      // Use a secondary app instance so the currently signed-in admin session is completely unaffected
      const secondaryApp = getApps().find(app => app.name === 'StudentRegistrar') || initializeApp(firebaseConfig, 'StudentRegistrar');
      const secondaryAuth = getAuth(secondaryApp);

      try {
        const res = await createUserWithEmailAndPassword(secondaryAuth, studentEmail, newStudent.password);
        
        await setDoc(doc(db, 'students', res.user.uid), {
          name: newStudent.name.trim(),
          class: newStudent.class,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newStudent.name.trim())}`,
          bio: newStudent.bio.trim() || "Cita-citaku ingin menjadi programmer hebat!",
          uid: res.user.uid,
          password: newStudent.password, // Save password so admin can view/look up when forgotten
          role: 'student'
        });

        await signOut(secondaryAuth);

        setRegisterStatus({ 
          type: 'success', 
          message: `Siswa ${newStudent.name.trim()} berhasil didaftarkan! Email login: ${studentEmail}` 
        });

        setNewStudent({
          name: '',
          class: '3A',
          password: 'codingkids123',
          bio: "Cita-citaku ingin menjadi programmer hebat!"
        });
        
        setTimeout(() => {
          setIsAddingStudent(false);
          setRegisterStatus({ type: '', message: '' });
        }, 3000);

      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          setRegisterStatus({ 
            type: 'error', 
            message: 'Nama siswa ini sudah terdaftar sebelumnya!' 
          });
        } else {
          setRegisterStatus({ type: 'error', message: authError.message || 'Gagal mendaftarkan akun siswa.' });
        }
      }
    } catch (err: any) {
      console.error("Student registry error:", err);
      setRegisterStatus({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus siswa ${name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${studentId}`);
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
             className={`px-4 py-2 rounded-xl font-black text-xs border-2 border-black transition-all ${activeTab === 'gallery' ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_0px_black]' : 'text-white'}`}
           >
             GALLERY KEGIATAN
           </button>
           <button 
             onClick={() => setActiveTab('students')}
             className={`px-4 py-2 rounded-xl font-black text-xs border-2 border-black transition-all ${activeTab === 'students' ? 'bg-[#4ECDC4] text-black shadow-[4px_4px_0px_black]' : 'text-white'}`}
           >
             KELOLA SISWA ({students.length})
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
                <h2 className="font-['Fredoka_One'] text-3xl uppercase">Gallery Kegiatan</h2>
                <p className="font-black text-gray-500 italic">Upload dokumentasi kegiatan untuk dilihat siswa.</p>
              </div>
              <button 
                onClick={() => setIsAddingGallery(true)} 
                className="bg-[#FF6B6B] text-white p-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-sm"
              >
                <Plus size={20} /> TAMBAH KEGIATAN
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.map(item => (
                <div key={item.id} className="bg-white border-4 border-black rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_black] group">
                  <div className="h-48 bg-gray-100 border-b-4 border-black overflow-hidden relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-['Fredoka_One'] text-xl mb-2">{item.title}</h3>
                    <p className="text-gray-500 font-bold text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black bg-gray-100 px-3 py-1 rounded-xl border-2 border-black">{item.likes?.length || 0} Likes</span>
                       <button onClick={() => handleDeleteGallery(item.id)} className="bg-[#FF6B6B] text-white p-2 rounded-xl border-2 border-black hover:translate-y-1 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isAddingGallery && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-10 rounded-[3rem] shadow-[16px_16px_0px_black] w-full max-w-xl">
                   <h3 className="font-['Fredoka_One'] text-2xl uppercase mb-8">Tambah Kegiatan Baru</h3>
                   <form onSubmit={handleAddGallery} className="space-y-4">
                     <input type="text" placeholder="Judul Kegiatan" required className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" value={newGallery.title} onChange={e => setNewGallery({...newGallery, title: e.target.value})} />
                     <textarea placeholder="Deskripsi Kegiatan" required className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold h-24" value={newGallery.description} onChange={e => setNewGallery({...newGallery, description: e.target.value})} />
                     <input type="url" placeholder="Link Gambar (URL)" required className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" value={newGallery.imageUrl} onChange={e => setNewGallery({...newGallery, imageUrl: e.target.value})} />
                     <button type="submit" className="w-full bg-[#FF6B6B] text-white py-4 rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_black] hover:shadow-none transition-all mt-4">SIMPAN KEGIATAN ✨</button>
                     <button type="button" onClick={() => setIsAddingGallery(false)} className="w-full font-black text-xs uppercase text-gray-400 mt-2">Batalkan</button>
                   </form>
                 </motion.div>
               </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="font-['Fredoka_One'] text-3xl uppercase">Manajemen Akun Siswa</h2>
                <p className="font-black text-gray-500 italic">Daftarkan akun dan lihat informasi login/password murid di sini.</p>
              </div>
              <button 
                onClick={() => setIsAddingStudent(true)} 
                className="bg-[#4ECDC4] text-black px-6 py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-sm"
              >
                <Plus size={20} /> DAFTAR SISWA BARU 🏫
              </button>
            </div>

            <div className="bg-white border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_black]">
               <div className="overflow-x-auto">
                 <table className="w-full text-left font-bold text-sm">
                   <thead>
                     <tr className="border-b-4 border-black text-sm uppercase tracking-widest text-gray-500">
                       <th className="pb-4">Siswa</th>
                       <th className="pb-4">Kelas</th>
                       <th className="pb-4">Username Login (Nama Sesuai Absen)</th>
                       <th className="pb-4">Password</th>
                       <th className="pb-4 text-center">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y-2 divide-gray-100">
                     {students.map((student) => {
                       const usernameExample = student.name;
                       const emailLogin = `${student.name.toLowerCase().trim().replace(/\s+/g, '.')}@sdq.id`;
                       const isRevealed = revealPasswords[student.id];
                       return (
                         <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="py-4 flex items-center gap-3">
                             <img src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt={student.name} className="w-10 h-10 rounded-full border-2 border-black" />
                             <div>
                               <p className="font-black font-['Fredoka_One'] text-base">{student.name}</p>
                               <span className="text-[10px] text-gray-400 block font-mono">{student.id}</span>
                             </div>
                           </td>
                           <td className="py-4">
                             <span className="bg-[#FFE66D] border-2 border-black px-3 py-1 rounded-lg text-xs uppercase tracking-tight">
                               Kelas {student.class}
                             </span>
                           </td>
                           <td className="py-4">
                             <div>
                               <p className="font-black text-[#FF8C32] select-all cursor-pointer">{usernameExample}</p>
                               <span className="text-xs text-gray-400 font-normal">atau email: {emailLogin}</span>
                             </div>
                           </td>
                           <td className="py-4">
                             <div className="flex items-center gap-2">
                               <input 
                                 type={isRevealed ? "text" : "password"} 
                                 value={student.password || "codingkids123"} 
                                 readOnly 
                                 className="bg-transparent border-none font-black text-sm outline-none w-32 tracking-wider"
                               />
                               <button 
                                 onClick={() => setRevealPasswords(prev => ({ ...prev, [student.id]: !prev[student.id] }))}
                                 className="text-gray-400 hover:text-black transition-colors"
                                 title={isRevealed ? "Sembunyikan" : "Tampilkan"}
                               >
                                 {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                               </button>
                             </div>
                           </td>
                           <td className="py-4 text-center">
                             <button 
                               onClick={() => handleDeleteStudent(student.id, student.name)}
                               className="p-2.5 bg-[#FF6B6B] text-white border-2 border-black rounded-xl hover:bg-[#FF4D4D] transition-all"
                               title="Hapus Siswa"
                             >
                               <Trash2 size={16} />
                             </button>
                           </td>
                         </tr>
                       );
                     })}
                     {students.length === 0 && (
                       <tr>
                         <td colSpan={5} className="text-center py-10 text-gray-400 italic">Belum ada murid terdaftar.</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

            {isAddingStudent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-10 rounded-[3rem] shadow-[16px_16px_0px_black] w-full max-w-xl text-[#2D3436]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-['Fredoka_One'] text-2xl uppercase">Daftarkan Siswa Baru</h3>
                    <button onClick={() => setIsAddingStudent(false)} className="bg-gray-100 p-2 rounded-xl border-2 border-black hover:bg-[#FF6B6B] hover:text-white transition-all"><X size={18} /></button>
                  </div>

                  {registerStatus.message && (
                    <div className={`p-4 rounded-xl border-2 border-black font-black text-sm mb-6 ${registerStatus.type === 'success' ? 'bg-[#6BCB77] text-white' : 'bg-[#FF6B6B] text-white'}`}>
                      {registerStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleRegisterStudent} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Nama Lengkap Murid *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Contoh: Alkholifi Amanullah Zayn" 
                        className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" 
                        value={newStudent.name} 
                        onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                      />
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">Username login siswa akan sama persis dengan Nama Lengkap ini (sensitif huruf kapital).</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Kelas *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Contoh: 3A" 
                          className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" 
                          value={newStudent.class} 
                          onChange={e => setNewStudent({...newStudent, class: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Password Login *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Password login" 
                          className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" 
                          value={newStudent.password} 
                          onChange={e => setNewStudent({...newStudent, password: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Cita-cita / Deskripsi singkat (Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="Cita-citaku ingin menjadi programmer hebat!" 
                        className="w-full p-4 bg-gray-50 border-2 border-black rounded-xl font-bold" 
                        value={newStudent.bio} 
                        onChange={e => setNewStudent({...newStudent, bio: e.target.value})} 
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isRegistering}
                      className="w-full bg-[#4ECDC4] text-black py-4 rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_black] hover:shadow-none transition-all mt-4 disabled:opacity-50"
                    >
                      {isRegistering ? 'MEMPROSES REGISTRASI...' : 'DAFTARKAN SISWA ✨'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        )
        }
      </main>
    </div>
  );
}
