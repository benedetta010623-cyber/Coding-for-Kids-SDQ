import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, updateDoc, doc, onSnapshot, orderBy, addDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Check, X, ExternalLink, Clock, User, BookOpen, Plus, Trash2, Users, Key, Eye, EyeOff, Upload, Download } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import * as XLSX from 'xlsx';

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
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkStudents, setBulkStudents] = useState<any[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
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

  const handleSyncCurriculum = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyelaraskan kurikulum dengan data Literasi Digital (Fase 1-4) dari modul PDF? Ini akan mereset data kurikulum lama.")) return;
    try {
      // First delete all existing curriculum items to ensure a clean slate
      for (const item of curriculum) {
        await deleteDoc(doc(db, 'curriculum', item.id));
      }

      const syncItems = [
        {
          id: 'm1',
          title: 'Dasar Komputer & Input (Fase 1 - Bulan 1)',
          desc: 'Pertemuan 1: Pengenalan Komputer (Bagian & fungsi dasar). Pertemuan 2: Mouse & Keyboard (Klik, drag, mengetik dasar). Pertemuan 3: Game Edukatif (Koordinasi mata-tangan). Pertemuan 4: Paint (Menggambar & mewarnai dasar).',
          semester: 1,
          duration: '4 Minggu',
          icon: 'Monitor',
          order: 1,
          status: 'active'
        },
        {
          id: 'm2',
          title: 'Kreativitas Paint & Dasar MS Word (Fase 1 - Bulan 2)',
          desc: 'Pertemuan 5: Kartu Nama di Paint (Menggunakan basic shape). Pertemuan 6: MS Word (Mengetik data sederhana & simpan file). Pertemuan 7: Menghias Teks (Pengaturan font, warna, ukuran). Pertemuan 8: Menyisipkan Gambar di Word.',
          semester: 1,
          duration: '4 Minggu',
          icon: 'Palette',
          order: 2,
          status: 'active'
        },
        {
          id: 'm3',
          title: 'Manajemen File & Internet Aman (Fase 1 - Bulan 3)',
          desc: 'Pertemuan 9: Simpan & Buka File (Manajemen folder). Pertemuan 10: Internet Aman (Pedoman berselancar aman). Pertemuan 11: Cari Gambar di Google (Pencarian ramah anak). Pertemuan 12: Review & Evaluasi Ringan.',
          semester: 1,
          duration: '4 Minggu',
          icon: 'Globe',
          order: 3,
          status: 'active'
        },
        {
          id: 'm4',
          title: 'Kreasi Cerita & Dasar Presentasi (Fase 2 - Bulan 4)',
          desc: 'Pertemuan 13: Cerita Mini di Word (Teks kreatif + gambar). Pertemuan 14: PowerPoint Slide Dasar (Judul & isi). Pertemuan 15: Desain Slide PowerPoint (Layout & estetika). Pertemuan 16: Proyek "Cita-Citaku" (Presentasi impian).',
          semester: 1,
          duration: '4 Minggu',
          icon: 'BookOpen',
          order: 4,
          status: 'active'
        },
        {
          id: 'm5',
          title: 'Olah Data Sederhana & Cloud Storage (Fase 2 - Bulan 5)',
          desc: 'Pertemuan 17: Excel Tabel Sederhana (Nama, umur, nilai). Pertemuan 18: Fungsi SUM Excel (Penjumlahan otomatis). Pertemuan 19: Pengenalan Google Drive. Pertemuan 20: Menyimpan File ke Drive (Manajemen cloud).',
          semester: 1,
          duration: '4 Minggu',
          icon: 'Rocket',
          order: 5,
          status: 'active'
        },
        {
          id: 'm6',
          title: 'Portofolio Digital & Evaluasi Akhir (Fase 2 - Bulan 6)',
          desc: 'Pertemuan 21: Portofolio Digital Mini (Kumpulan Word + PPT + Gambar). Pertemuan 22: Presentasi Portofolio (Tampil di depan kelas). Pertemuan 23: Review & Penguatan Materi. Pertemuan 24: Evaluasi Akhir & Pembagian Sertifikat.',
          semester: 1,
          duration: '4 Minggu',
          icon: 'Palette',
          order: 6,
          status: 'active'
        },
        {
          id: 'm7',
          title: 'Aplikasi Praktis & Kolaborasi (Fase 3 - Bulan 7)',
          desc: 'Pertemuan 25: Word Cerita Bergambar. Pertemuan 26: PowerPoint Cerita Digital (Animasi dasar). Pertemuan 27: Excel Grafik Sederhana (Grafik batang). Pertemuan 28: Google Docs (Mengetik kolaboratif bersama teman).',
          semester: 2,
          duration: '4 Minggu',
          icon: 'BookOpen',
          order: 7,
          status: 'coming_soon'
        },
        {
          id: 'm8',
          title: 'Desain Canva & Kampanye Digital (Fase 3 - Bulan 8)',
          desc: 'Pertemuan 29: Pengenalan Canva Dasar. Pertemuan 30: Proyek Mini Poster "Internet Aman untuk Anak". Pertemuan 31: Presentasi Proyek Mini. Pertemuan 32: Sesi Umpan Balik & Revisi Desain Poster.',
          semester: 2,
          duration: '4 Minggu',
          icon: 'Palette',
          order: 8,
          status: 'coming_soon'
        },
        {
          id: 'm9',
          title: 'Game Literasi & Sinergi Tim (Fase 3 - Bulan 9)',
          desc: 'Pertemuan 33: Review Fase 3. Pertemuan S: Game Literasi Digital Tim (Kompetensi kelompok). Pertemuan 35: Simulasi Kolaborasi Digital (Google Slides). Pertemuan 36: Refleksi Diri & Berbagi Kemajuan.',
          semester: 2,
          duration: '4 Minggu',
          icon: 'Globe',
          order: 9,
          status: 'coming_soon'
        },
        {
          id: 'm10',
          title: 'Perancangan Proyek Akhir (Fase 4 - Bulan 10)',
          desc: 'Pertemuan 37: Penentuan Tema Proyek Kelompok. Pertemuan 38: Menulis Naskah & Kerangka Slide Bersama. Pertemuan 39: Desain Presentasi Interaktif. Pertemuan 40: Latihan & Simulasi Presentasi Digital.',
          semester: 2,
          duration: '4 Minggu',
          icon: 'Rocket',
          order: 10,
          status: 'coming_soon'
        },
        {
          id: 'm11',
          title: 'Eksekusi Proyek & Portofolio Lengkap (Fase 4 - Bulan 11)',
          desc: 'Pertemuan 41: Presentasi Proyek Digital Kelompok. Pertemuan 42: Evaluasi & Feedbacks Konstruktif. Pertemuan 43: Menyusun Portofolio Digital Lengkap di Drive. Pertemuan 44: Refleksi Bersama & Diskusi Proses Belajar.',
          semester: 2,
          duration: '4 Minggu',
          icon: 'Monitor',
          order: 11,
          status: 'coming_soon'
        },
        {
          id: 'm12',
          title: 'Showcase Karya & Kelulusan (Fase 4 - Bulan 12)',
          desc: 'Pertemuan 45: Pameran Mini Proyek Digital (Sajian untuk Orang Tua & Guru). Pertemuan 46: Kuis Akhir Literasi Digital. Pertemuan 47: Penguatan Etika & Aman Online. Pertemuan 48: Upacara Kelulusan & Sertifikasi.',
          semester: 2,
          duration: '4 Minggu',
          icon: 'Globe',
          order: 12,
          status: 'coming_soon'
        }
      ];

      for (const item of syncItems) {
        await setDoc(doc(db, 'curriculum', item.id), item);
      }
      alert("Sinkronisasi kurikulum selesai dengan sukses! 🚀");
    } catch (error: any) {
      alert("Gagal melakukan sinkronisasi kurikulum: " + error.message);
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

  const downloadTemplate = () => {
    const templateData = [
      { "Nama Siswa": "Zayn Malik", "Kelas": "3A", "Username login": "zayn.malik", "Password": "codingkids123" },
      { "Nama Siswa": "Ariel Noah", "Kelas": "4B", "Username login": "ariel.noah", "Password": "codingkids123" }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa");
    XLSX.writeFile(wb, "template_upload_siswa.xlsx");
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const mappedStudents = jsonData.map((row: any, index: number) => {
          const findValue = (possibleKeys: string[]) => {
            const keyFound = Object.keys(row).find(k => 
              possibleKeys.some(pk => k.toLowerCase().replace(/\s+/g, '') === pk.toLowerCase().replace(/\s+/g, ''))
            );
            return keyFound ? String(row[keyFound]).trim() : '';
          };

          const name = findValue(['NamaSiswa', 'Nama', 'Name', 'NamaLengkap']);
          const className = findValue(['Kelas', 'Class']);
          const username = findValue(['Usernamelogin', 'Username', 'User']);
          const password = findValue(['Password', 'Sandi', 'Pass']) || 'codingkids123';
          const bio = findValue(['Bio', 'Deskripsi', 'Cita-Cita', 'CitaCita']) || 'Cita-citaku ingin menjadi programmer hebat!';

          return {
            id: index,
            name,
            class: className,
            username,
            password,
            bio,
            status: 'pending',
            message: ''
          };
        }).filter(s => s.name);

        if (mappedStudents.length === 0) {
          alert("Tidak ditemukan data siswa yang valid di file Excel!");
        } else {
          setBulkStudents(mappedStudents);
        }
      } catch (err: any) {
        alert("Gagal membaca file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const startBulkUpload = async () => {
    if (bulkStudents.length === 0) {
      alert("Belum ada data siswa untuk diunggah!");
      return;
    }

    setIsProcessingBulk(true);
    setBulkProgress({ current: 0, total: bulkStudents.length });

    const secondaryApp = getApps().find(app => app.name === 'StudentRegistrar') || initializeApp(firebaseConfig, 'StudentRegistrar');
    const secondaryAuth = getAuth(secondaryApp);

    for (let i = 0; i < bulkStudents.length; i++) {
      const student = bulkStudents[i];
      if (student.status === 'success') {
        continue;
      }
      
      setBulkStudents(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'processing' } : s));
      setBulkProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        if (!student.name || !student.class || !student.password) {
          throw new Error("Kolom Nama, Kelas, atau Password kosong!");
        }

        if (student.password.length < 6) {
          throw new Error("Password minimal harus 6 karakter!");
        }

        let studentEmail = '';
        if (student.username) {
          studentEmail = `${student.username.toLowerCase().trim().replace(/\s+/g, '.')}@sdq.id`;
        } else {
          studentEmail = `${student.name.toLowerCase().trim().replace(/\s+/g, '.')}@sdq.id`;
        }

        const res = await createUserWithEmailAndPassword(secondaryAuth, studentEmail, student.password);

        await setDoc(doc(db, 'students', res.user.uid), {
          name: student.name.trim(),
          class: student.class.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name.trim())}`,
          bio: student.bio.trim() || "Cita-citaku ingin menjadi programmer hebat!",
          uid: res.user.uid,
          password: student.password,
          role: 'student'
        });

        await signOut(secondaryAuth);

        setBulkStudents(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'success', message: `Sukses! Login: ${studentEmail}` } : s));

      } catch (err: any) {
        console.error(`Gagal mendaftarkan siswa ${student.name}:`, err);
        let errorMsg = err.message || 'Gagal mendaftarkan akun';
        if (err.code === 'auth/email-already-in-use') {
          errorMsg = 'Nama atau username sudah terdaftar!';
        }
        setBulkStudents(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error', message: errorMsg } : s));
      }

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsProcessingBulk(false);
    alert("Proses unggah daftar siswa selesai!");
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
              <div className="flex gap-4">
                <button 
                  onClick={handleSyncCurriculum} 
                  className="bg-[#FFD93D] text-black px-5 py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-xs"
                >
                  🚀 SINKRONISASI KURIKULUM LENGKAP
                </button>
                <button 
                  onClick={() => setIsAddingModule(true)} 
                  className="bg-[#4ECDC4] text-white px-5 py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-xs"
                >
                  <Plus size={16} /> TAMBAH MODUL
                </button>
              </div>
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
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsBulkUploadOpen(true)} 
                  className="bg-[#FFD93D] text-black px-6 py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-sm"
                >
                  <Upload size={16} /> UPLOAD DAFTAR SISWA 📈
                </button>
                <button 
                  onClick={() => setIsAddingStudent(true)} 
                  className="bg-[#4ECDC4] text-black px-6 py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-none transition-all flex items-center gap-2 font-black uppercase text-sm"
                >
                  <Plus size={20} /> DAFTAR SISWA BARU 🏫
                </button>
              </div>
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

            {isBulkUploadOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="bg-white border-4 border-black p-10 rounded-[3rem] shadow-[16px_16px_0px_black] w-full max-w-4xl text-[#2D3436] my-8 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-['Fredoka_One'] text-2xl uppercase">Upload Daftar Siswa Massal</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">Upload data dari file Excel (.xlsx, .xls) atau CSV.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsBulkUploadOpen(false);
                        setBulkStudents([]);
                      }} 
                      className="bg-gray-100 p-2 rounded-xl border-2 border-black hover:bg-[#FF6B6B] hover:text-white transition-all"
                      disabled={isProcessingBulk}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-[#FFE66D]/20 border-4 border-dashed border-black p-6 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-sm uppercase mb-2">📋 Format Kolom yang Dibaca:</h4>
                      <ul className="text-xs font-bold space-y-1 text-gray-700 list-disc pl-4">
                        <li><strong>Nama Siswa</strong> (Nama lengkap siswa, digunakan sebagai nama login)</li>
                        <li><strong>Kelas</strong> (Contoh: 3A, 4B)</li>
                        <li><strong>Username login</strong> (Opsional, jika kosong akan digenerate otomatis dari nama)</li>
                        <li><strong>Password</strong> (Minimal 6 karakter, contoh: codingkids123)</li>
                      </ul>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4">
                      <p className="text-xs font-bold text-center text-gray-600">Butuh contoh susunan kolom? Download template resmi:</p>
                      <button 
                        onClick={downloadTemplate}
                        className="bg-[#FFE66D] text-black px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs uppercase shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download size={14} /> Download Template Excel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 border-4 border-black p-6 rounded-2xl text-center relative hover:bg-gray-100/50 transition-colors">
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleExcelFileChange}
                        disabled={isProcessingBulk}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={32} className="text-[#FF8C32]" />
                        <span className="font-black text-sm">Pilih atau Seret File Excel/CSV di sini</span>
                        <span className="text-xs text-gray-400 font-bold">Mendukung format .xlsx, .xls, .csv</span>
                      </div>
                    </div>

                    {bulkStudents.length > 0 && (
                      <div className="border-4 border-black rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left font-bold text-xs bg-white">
                          <thead className="bg-gray-100 sticky top-0 border-b-2 border-black">
                            <tr>
                              <th className="p-3">No</th>
                              <th className="p-3">Nama Siswa</th>
                              <th className="p-3">Kelas</th>
                              <th className="p-3">Username Login</th>
                              <th className="p-3">Password</th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bulkStudents.map((student, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-400 font-mono">{idx + 1}</td>
                                <td className="p-3 font-black">{student.name}</td>
                                <td className="p-3">
                                  <span className="bg-gray-100 border border-black px-2 py-0.5 rounded text-[10px]">Kelas {student.class}</span>
                                </td>
                                <td className="p-3 text-gray-500 font-mono">{student.username || '-'}</td>
                                <td className="p-3 text-gray-500 font-mono">{student.password}</td>
                                <td className="p-3 text-center">
                                  {student.status === 'pending' && (
                                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-black text-[10px]">Menunggu</span>
                                  )}
                                  {student.status === 'processing' && (
                                    <span className="bg-[#FFE66D] text-black px-2.5 py-1 rounded-full border border-black text-[10px] animate-pulse">Memproses</span>
                                  )}
                                  {student.status === 'success' && (
                                    <span className="bg-[#6BCB77] text-white px-2.5 py-1 rounded-full border border-black text-[10px]" title={student.message}>Berhasil</span>
                                  )}
                                  {student.status === 'error' && (
                                    <span className="bg-[#FF6B6B] text-white px-2.5 py-1 rounded-full border border-black text-[10px]" title={student.message}>Gagal</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {isProcessingBulk && (
                      <div className="space-y-2">
                        <div className="flex justify-between font-black text-xs uppercase text-gray-500">
                          <span>Mendaftarkan Akun Siswa...</span>
                          <span>{bulkProgress.current} / {bulkProgress.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden border-2 border-black">
                          <div 
                            className="bg-[#4ECDC4] h-full transition-all duration-300"
                            style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={startBulkUpload}
                        disabled={isProcessingBulk || bulkStudents.length === 0}
                        className="flex-1 bg-[#4ECDC4] text-black py-4 rounded-xl border-4 border-black font-black text-lg shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessingBulk ? 'SEDANG MEMPROSES...' : `MULAI IMPORT ${bulkStudents.length} SISWA 🚀`}
                      </button>
                      <button
                        onClick={() => {
                          setIsBulkUploadOpen(false);
                          setBulkStudents([]);
                        }}
                        disabled={isProcessingBulk}
                        className="bg-gray-100 text-gray-500 px-6 py-4 rounded-xl border-4 border-black font-black text-xs uppercase cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
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
