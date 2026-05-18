import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function InitPage() {
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const seedData = async () => {
    setStatus('Memulai proses setup database...');
    try {
      // 1. Create Admin
      const adminEmail = 'admin@sdq.id';
      const adminPass = 'adminSDQ123';
      let adminUid = '';

      try {
        const res = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
        adminUid = res.user.uid;
        setStatus(prev => prev + '\n✅ Akun Admin BARU dibuat.');
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          const res = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
          adminUid = res.user.uid;
          setStatus(prev => prev + '\nℹ️ Akun Admin SUDAH ADA (Login berhasil).');
        } else throw err;
      }
      await setDoc(doc(db, 'admins', adminUid), { email: adminEmail });

      // 2. Create initial curriculum (Must be done while Admin is logged in)
      const initialCurriculum = [
        { id: 'm1', title: 'Visual Programming 1', desc: 'Pengenalan logika dasar, animasi, dan storytelling menggunakan Scratch.', semester: 1, duration: '4 Minggu', icon: 'Rocket', order: 1, status: 'active' },
        { id: 'm2', title: 'Digital Artistry', desc: 'Belajar membuat aset grafis digital dan ilustrasi menggunakan MS Paint & Canva.', semester: 1, duration: '4 Minggu', icon: 'Palette', order: 2, status: 'active' },
        { id: 'm3', title: 'Web Development Kids', desc: 'Membuat website portofolio pertama menggunakan HTML & CSS sederhana.', semester: 2, duration: '6 Minggu', icon: 'Globe', order: 3, status: 'coming_soon' }
      ];

      for (const item of initialCurriculum) {
        await setDoc(doc(db, 'curriculum', item.id), item);
      }
      setStatus(prev => prev + '\n✅ Data Kurikulum AWAL dibuat.');

      // 3. Create example student
      const studentName = "Alkholifi Amanullah Zayn";
      const studentEmail = 'alkholifi.amanullah.zayn@sdq.id';
      const studentPass = 'codingkids123';
      let studentUid = '';

      try {
        const res = await createUserWithEmailAndPassword(auth, studentEmail, studentPass);
        studentUid = res.user.uid;
        setStatus(prev => prev + `\n✅ Akun Siswa (${studentName}) BARU dibuat.`);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          // Temporarily sign in to get UID
          const res = await signInWithEmailAndPassword(auth, studentEmail, studentPass);
          studentUid = res.user.uid;
          setStatus(prev => prev + `\nℹ️ Akun Siswa (${studentName}) SUDAH ADA.`);
        } else throw err;
      }

      await setDoc(doc(db, 'students', studentUid), {
        name: studentName,
        class: "3B",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alkholifi",
        bio: "Cita-citaku ingin menjadi programmer robot yang hafal Al-Qur'an.",
        uid: studentUid,
        role: 'student'
      });

      setStatus(prev => prev + '\n\n🎉 DATABASE SIAP DIGUNAKAN!');
      setStatus(prev => prev + '\n-------------------------');
      setStatus(prev => prev + `\nLOGIN GURU: admin@sdq.id / ${adminPass}`);
      setStatus(prev => prev + `\nLOGIN SISWA: ${studentName} / ${studentPass}`);
    } catch (err: any) {
      setStatus(prev => prev + '\n❌ Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-10 font-mono">
      <h1 className="text-2xl mb-4 uppercase tracking-widest">{">"} DATABASE SETUP</h1>
      <p className="mb-4 text-white">Konfigurasi akun awal untuk aplikasi.</p>
      <button 
        onClick={seedData}
        className="bg-green-500 text-black px-6 py-2 rounded font-bold hover:bg-green-400 mb-6 shadow-[4px_4px_0px_white]"
      >
        JALANKAN SETUP
      </button>
      <pre className="mt-4 bg-gray-900 p-6 border border-green-900 overflow-auto max-h-96 text-sm">
        {status || 'Menunggu perintah...'}
      </pre>
      <div className="mt-10 flex gap-6">
        <button onClick={() => navigate('/login')} className="bg-white text-black px-4 py-2 font-bold rounded">LOG IN SEKARANG</button>
        <button onClick={() => navigate('/')} className="text-white underline text-sm">Kembali ke Beranda</button>
      </div>
    </div>
  );
}

