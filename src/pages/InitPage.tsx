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

