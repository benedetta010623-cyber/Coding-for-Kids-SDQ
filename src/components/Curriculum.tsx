import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Palette, Monitor, Globe, Clock, ChevronDown, ChevronUp, BookOpen, CheckCircle2, Award, Sparkles, Target, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const DEFAULT_CURRICULUM = [
  // SEMESTER 1 - FASE 1 (Bulan 1-3)
  {
    id: 'm1',
    phase: 'Fase 1: Pembiasaan & Pengenalan',
    month: 'Bulan 1',
    title: 'Pengenalan Komputer & Input Dasar',
    desc: 'Mengenal perangkat keras komputer, melatih penggunaan mouse & keyboard, serta game edukatif koordinasi.',
    semester: 1,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Monitor',
    order: 1,
    status: 'active',
    items: [
      { no: 1, materi: 'Pengenalan komputer', tujuan: 'Menyebut bagian & fungsi dasar' },
      { no: 2, materi: 'Mouse & keyboard', tujuan: 'Menguasai klik, drag, dasar mengetik' },
      { no: 3, materi: 'Game edukatif (klik & ketik)', tujuan: 'Melatih koordinasi mata–tangan' },
      { no: 4, materi: 'Paint – menggambar & mewarnai', tujuan: 'Kreativitas visual dasar' }
    ]
  },
  {
    id: 'm2',
    phase: 'Fase 1: Pembiasaan & Pengenalan',
    month: 'Bulan 2',
    title: 'Kreativitas Paint & Dasar MS Word',
    desc: 'Membuat kartu nama sederhana di Paint, belajar mengetik data, menghias teks, dan menyisipkan gambar di Word.',
    semester: 1,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Palette',
    order: 2,
    status: 'active',
    items: [
      { no: 5, materi: 'Membuat Kartu nama di Paint (basic shape)', tujuan: 'Proyek kreativitas sederhana' },
      { no: 6, materi: 'MS Word: mengetik data sederhana', tujuan: 'Latihan mengetik dan simpan file' },
      { no: 7, materi: 'Menghias teks di Word', tujuan: 'Pengaturan font (ukuran, warna, jenis)' },
      { no: 8, materi: 'Menyisipkan gambar di Word', tujuan: 'Gabungkan teks dan gambar' }
    ]
  },
  {
    id: 'm3',
    phase: 'Fase 1: Pembiasaan & Pengenalan',
    month: 'Bulan 3',
    title: 'Manajemen File & Internet Aman',
    desc: 'Manajemen file & folder, pedoman berselancar aman, pencarian gambar anak di Google, serta review & evaluasi ringan.',
    semester: 1,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Globe',
    order: 3,
    status: 'active',
    items: [
      { no: 9, materi: 'Menyimpan & membuka file', tujuan: 'Manajemen file & folder' },
      { no: 10, materi: 'Internet aman', tujuan: 'Pedoman berselancar yang aman' },
      { no: 11, materi: 'Mencari gambar di Google', tujuan: 'Pencarian visual yang sesuai usia' },
      { no: 12, materi: 'Review & evaluasi ringan', tujuan: 'Mengulang materi lewat aktivitas menyenangkan' }
    ]
  },

  // SEMESTER 1 - FASE 2 (Bulan 4-6)
  {
    id: 'm4',
    phase: 'Fase 2: Pendalaman & Penguatan',
    month: 'Bulan 4',
    title: 'Cerita Digital & Dasar PowerPoint',
    desc: 'Menulis cerita mini bergambar di Word, membuat slide PowerPoint, mendesain estetika slide, dan proyek "Cita-Citaku".',
    semester: 1,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'BookOpen',
    order: 4,
    status: 'active',
    items: [
      { no: 13, materi: 'Cerita mini di Word', tujuan: 'Teks kreatif + gambar' },
      { no: 14, materi: 'PowerPoint: slide dasar', tujuan: 'Membuat slide judul & isi' },
      { no: 15, materi: 'Desain slide PowerPoint', tujuan: 'Layout & estetika slide' },
      { no: 16, materi: 'Proyek "Cita-Citaku"', tujuan: 'Presentasi 3–4 slide tentang impian' }
    ]
  },
  {
    id: 'm5',
    phase: 'Fase 2: Pendalaman & Penguatan',
    month: 'Bulan 5',
    title: 'Olah Data Excel & Cloud Storage',
    desc: 'Tabel data sederhana di Excel, fungsi rumus SUM otomatis, pengenalan Google Drive, dan menyimpan file ke cloud.',
    semester: 1,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Rocket',
    order: 5,
    status: 'active',
    items: [
      { no: 17, materi: 'Excel: tabel data sederhana', tujuan: 'Pengisian tabel nama, umur, nilai' },
      { no: 18, materi: 'Fungsi SUM di Excel', tujuan: 'Menggunakan fungsi penjumlahan otomatis' },
      { no: 19, materi: 'Google Drive', tujuan: 'Pengenalan penyimpanan online' },
      { no: 20, materi: 'Menyimpan file ke Drive', tujuan: 'Latihan manajemen file di cloud' }
    ]
  },
  {
    id: 'm6',
    phase: 'Fase 2: Pendalaman & Penguatan',
    month: 'Bulan 6',
    title: 'Portofolio Digital & Evaluasi Akhir',
    desc: 'Menyusun portofolio digital mini, mempresentasikan karya, review materi, serta ujian evaluasi & sertifikat.',
    semester: 1,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Palette',
    order: 6,
    status: 'active',
    items: [
      { no: 21, materi: 'Portofolio digital mini', tujuan: 'Kumpulan karya (Word + PPT + gambar)' },
      { no: 22, materi: 'Presentasi portofolio', tujuan: 'Anak mempresentasikan hasil' },
      { no: 23, materi: 'Review & penguatan materi', tujuan: 'Diskusi, kuis, permainan edukatif' },
      { no: 24, materi: 'Evaluasi akhir & sertifikat', tujuan: 'Ujian keterampilan & pemberian penghargaan' }
    ]
  },

  // SEMESTER 2 - SCRATCH CURRICULUM (Bulan 7-12 / Scratch Bulan 1-6)
  {
    id: 'm7',
    phase: 'Scratch: Bulan 1',
    month: 'Bulan 7',
    title: 'Pengenalan Scratch & Logika Dasar',
    desc: 'Mengenal antarmuka Scratch, Sprite & Stage, gerak dasar (move, turn, go to), dan Sequence (gerak berurutan). Proyek Mini: Sprite bergerak & menyapa.',
    semester: 2,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Monitor',
    order: 7,
    status: 'active',
    items: [
      { no: 1, materi: 'Apa itu Scratch & eksplorasi tampilan', tujuan: 'Mengenal antarmuka Scratch & urutan perintah' },
      { no: 2, materi: 'Sprite & Stage (ganti karakter & background)', tujuan: 'Mengganti karakter sprite dan latar background' },
      { no: 3, materi: 'Gerak dasar (move, turn, go to)', tujuan: 'Menguasai pergerakan dasar sprite' },
      { no: 4, materi: 'Sequence: gerak berurutan', tujuan: 'Menyusun urutan perintah (sequence)' }
    ]
  },
  {
    id: 'm8',
    phase: 'Scratch: Bulan 2',
    month: 'Bulan 8',
    title: 'Event, Kontrol, & Interaksi Keyboard',
    desc: 'Respon terhadap perintah dan kontrol alur: Event green flag, kontrol wait & repeat, loop forever, dan interaksi keyboard. Proyek Mini: Karakter berjalan dengan tombol keyboard.',
    semester: 2,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Rocket',
    order: 8,
    status: 'active',
    items: [
      { no: 5, materi: 'Event: when green flag clicked', tujuan: 'Memulai alur perintah dengan bendera hijau' },
      { no: 6, materi: 'Kontrol: wait & repeat', tujuan: 'Pengaturan jeda waktu dan pengulangan berulang' },
      { no: 7, materi: 'Loop: forever & repeat', tujuan: 'Membuat animasi/perintah berulang terus-menerus' },
      { no: 8, materi: 'Interaksi keyboard (when key pressed)', tujuan: 'Mengontrol pergerakan karakter dengan tombol keyboard' }
    ]
  },
  {
    id: 'm9',
    phase: 'Scratch: Bulan 3',
    month: 'Bulan 9',
    title: 'Logika & Kondisi (Decision Making)',
    desc: 'Pengambilan keputusan sederhana menggunakan If–then, If–then–else, sensor sentuh (touching sprite), serta review tantangan logika. Proyek Mini: Game sentuh objek.',
    semester: 2,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'BookOpen',
    order: 9,
    status: 'active',
    items: [
      { no: 9, materi: 'If – then (kondisi dasar)', tujuan: 'Pengambilan keputusan logika dasar' },
      { no: 10, materi: 'If – then – else', tujuan: 'Pengambilan keputusan dengan dua cabang kondisi' },
      { no: 11, materi: 'Sensor sentuh (touching sprite)', tujuan: 'Mendeteksi benturan/sentuhan antar sprite' },
      { no: 12, materi: 'Review & tantangan logika', tujuan: 'Uji logika & pemecahan masalah sederhana' }
    ]
  },
  {
    id: 'm10',
    phase: 'Scratch: Bulan 4',
    month: 'Bulan 10',
    title: 'Suara, Skor, & Variabel (Game Mechanics)',
    desc: 'Game mechanics sederhana: menambahkan sound & voice, variabel skor, dan mengubah skor otomatis. Proyek Game: Game tangkap objek.',
    semester: 2,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Palette',
    order: 10,
    status: 'active',
    items: [
      { no: 13, materi: 'Sound & voice sederhana', tujuan: 'Menambahkan efek suara dan narasi suara' },
      { no: 14, materi: 'Variabel: skor', tujuan: 'Membuat variabel untuk menyimpan nilai skor' },
      { no: 15, materi: 'Mengubah skor otomatis', tujuan: 'Penambahan & pengurangan skor secara otomatis' },
      { no: 16, materi: 'Proyek game skor sederhana', tujuan: 'Membuat game mekanik tangkap objek' }
    ]
  },
  {
    id: 'm11',
    phase: 'Scratch: Bulan 5',
    month: 'Bulan 11',
    title: 'Animasi & Storytelling Digital',
    desc: 'Ekspresi cerita digital: costume & animasi gerak, dialog & pergantian scene, serta broadcast (pesan antar sprite). Proyek: Cerita Islami / cerita edukatif.',
    semester: 2,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Globe',
    order: 11,
    status: 'active',
    items: [
      { no: 17, materi: 'Costume & animasi gerak', tujuan: 'Membuat animasi sprite bergerak via pergantian kostum' },
      { no: 18, materi: 'Dialog & pergantian scene', tujuan: 'Membuat percakapan karakter dan transisi latar' },
      { no: 19, materi: 'Broadcast (pesan antar sprite)', tujuan: 'Mengirim sinyal komunikasi antar sprite' },
      { no: 20, materi: 'Proyek cerita interaktif', tujuan: 'Membuat cerita Islami / cerita edukatif interaktif' }
    ]
  },
  {
    id: 'm12',
    phase: 'Scratch: Bulan 6',
    month: 'Bulan 12',
    title: 'Proyek Akhir & Portofolio Scratch',
    desc: 'Integrasi semua konsep: menentukan ide, membangun proyek mandiri, presentasi & perbaikan, serta pameran mini & evaluasi akhir. Proyek Akhir: Game / animasi / cerita Scratch.',
    semester: 2,
    duration: '4 Pertemuan (60-90 mnt)',
    icon: 'Rocket',
    order: 12,
    status: 'active',
    items: [
      { no: 21, materi: 'Menentukan ide proyek akhir', tujuan: 'Merancang ide game/animasi/cerita mandiri' },
      { no: 22, materi: 'Membangun proyek mandiri', tujuan: 'Mengembangkan proyek Scratch secara mandiri' },
      { no: 23, materi: 'Presentasi & perbaikan proyek', tujuan: 'Mempresentasikan karya & merevisi berdasarkan masukan' },
      { no: 24, materi: 'Pameran mini & evaluasi akhir', tujuan: 'Pameran portofolio Scratch & penyerahan sertifikat' }
    ]
  }
];

const iconMap: any = {
  Rocket: <Rocket size={24} className="text-[#FF6B6B]" />,
  Palette: <Palette size={24} className="text-[#4ECDC4]" />,
  Monitor: <Monitor size={24} className="text-[#45B7D1]" />,
  Globe: <Globe size={24} className="text-[#96CEB4]" />,
  BookOpen: <BookOpen size={24} className="text-[#FFE66D]" />
};

export default function Curriculum() {
  const [modules, setModules] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>(1);
  const [expandedId, setExpandedId] = useState<string | null>('m1');

  useEffect(() => {
    const q = query(collection(db, 'curriculum'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setModules(data);
      } else {
        setModules(DEFAULT_CURRICULUM);
      }
    }, () => {
      setModules(DEFAULT_CURRICULUM);
    });
    return unsubscribe;
  }, []);

  const activeModules = modules.length > 0 ? modules : DEFAULT_CURRICULUM;
  const filteredModules = selectedSemester === 'all' 
    ? activeModules 
    : activeModules.filter(m => m.semester === selectedSemester);

  return (
    <div className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="text-center mb-12">
        <div className="inline-block bg-white border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[8px_8px_0px_#FFD93D] mb-6 transform -rotate-1">
          <h2 className="font-['Fredoka_One'] text-3xl sm:text-5xl text-black flex items-center justify-center gap-3">
            <Sparkles className="text-[#FF6B6B] animate-bounce" size={36} />
            KURIKULUM CODING & LITERASI DIGITAL
          </h2>
          <p className="text-sm sm:text-lg font-black text-gray-700 mt-2 uppercase tracking-wide">
            SDQ AL MAHMUDAH (Sem 1: Literasi Digital • Sem 2: Scratch Coding)
          </p>
        </div>

        {/* Program Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto my-8">
          <div className="bg-[#FFE66D] border-3 border-black p-3 rounded-2xl shadow-[4px_4px_0px_black] text-center">
            <Clock className="mx-auto mb-1 text-black" size={20} />
            <span className="font-black text-xs block">DURASI</span>
            <span className="font-bold text-[11px] text-gray-800">6 Bulan / Semester (24 Pertemuan)</span>
          </div>
          <div className="bg-[#4ECDC4] border-3 border-black p-3 rounded-2xl shadow-[4px_4px_0px_black] text-center">
            <Target className="mx-auto mb-1 text-black" size={20} />
            <span className="font-black text-xs block">TARGET USIA</span>
            <span className="font-bold text-[11px] text-gray-800">7 – 10 Tahun (SD)</span>
          </div>
          <div className="bg-[#FF9FF3] border-3 border-black p-3 rounded-2xl shadow-[4px_4px_0px_black] text-center">
            <Users className="mx-auto mb-1 text-black" size={20} />
            <span className="font-black text-xs block">METODE</span>
            <span className="font-bold text-[11px] text-gray-800">Praktik & Proyek Kreatif</span>
          </div>
          <div className="bg-[#54A0FF] border-3 border-black p-3 rounded-2xl shadow-[4px_4px_0px_black] text-center text-white">
            <Award className="mx-auto mb-1 text-white" size={20} />
            <span className="font-black text-xs block">OUTPUT</span>
            <span className="font-bold text-[11px]">Portofolio & Sertifikat</span>
          </div>
        </div>

        {/* Semester Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3 my-6">
          <button
            onClick={() => setSelectedSemester(1)}
            className={`px-6 py-3 rounded-2xl font-black text-sm border-3 border-black transition-all ${
              selectedSemester === 1 
                ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_black] scale-105' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🟡 SEMESTER 1 (Literasi Digital • Bulan 1–6)
          </button>
          <button
            onClick={() => setSelectedSemester(2)}
            className={`px-6 py-3 rounded-2xl font-black text-sm border-3 border-black transition-all ${
              selectedSemester === 2 
                ? 'bg-[#B4A7D6] text-black shadow-[4px_4px_0px_black] scale-105' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🟣 SEMESTER 2 (Scratch Coding • Bulan 7–12)
          </button>
          <button
            onClick={() => setSelectedSemester('all')}
            className={`px-6 py-3 rounded-2xl font-black text-sm border-3 border-black transition-all ${
              selectedSemester === 'all' 
                ? 'bg-[#4ECDC4] text-black shadow-[4px_4px_0px_black] scale-105' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🌐 SEMUA MATERI (Bulan 1–12)
          </button>
        </div>
      </div>

      {/* Modules Grid / Cards */}
      <div className="space-y-6">
        {filteredModules.map((module, idx) => {
          const isExpanded = expandedId === module.id;
          const defaultItems = DEFAULT_CURRICULUM.find(d => d.id === module.id)?.items || [];
          const itemsToDisplay = module.items && module.items.length > 0 ? module.items : defaultItems;

          return (
            <motion.div 
              key={module.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_black] overflow-hidden transition-all hover:shadow-[12px_12px_0px_black]"
            >
              {/* Card Header */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : module.id)}
                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white to-gray-50 border-b-2 border-black/10"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-14 bg-[#F3F4F6] border-3 border-black rounded-2xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_black]">
                    {iconMap[module.icon] || <BookOpen size={24} className="text-[#FF6B6B]" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="bg-black text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {module.month || `Bulan ${module.order}`}
                      </span>
                      <span className="bg-[#FFE66D] border-2 border-black text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {module.phase || (module.semester === 1 ? 'Fase 1 / 2' : 'Fase 3 / 4')}
                      </span>
                    </div>
                    <h3 className="font-['Fredoka_One'] text-xl sm:text-2xl text-black">
                      {module.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-200">
                  <div className="text-right">
                    <span className="text-[11px] font-black text-gray-500 block uppercase">Alokasi Waktu</span>
                    <span className="text-xs font-black text-[#FF6B6B] flex items-center justify-end gap-1">
                      <Clock size={12} /> {module.duration || '4 Pertemuan'}
                    </span>
                  </div>
                  <button className="w-10 h-10 bg-[#FFD93D] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_black] hover:translate-y-0.5 transition-all">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="px-6 py-4 bg-yellow-50/50 border-b-2 border-black/5 text-gray-700 font-bold text-sm leading-relaxed">
                {module.desc}
              </div>

              {/* Detailed Breakdown (Pertemuan Table) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-slate-50"
                  >
                    <h4 className="font-['Fredoka_One'] text-base text-black mb-4 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-[#4ECDC4]" />
                      RINCIAN MATERI & TUJUAN PEMBELAJARAN PERTEMUAN:
                    </h4>

                    {itemsToDisplay && itemsToDisplay.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {itemsToDisplay.map((item: any, i: number) => (
                          <div 
                            key={i} 
                            className="bg-white border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_black] flex items-start gap-3"
                          >
                            <span className="w-8 h-8 bg-[#4ECDC4] border-2 border-black text-black font-black text-xs rounded-lg flex items-center justify-center shrink-0 shadow-[1px_1px_0px_black]">
                              {item.no || i + 1}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-black text-sm text-black mb-1">
                                {item.materi}
                              </h5>
                              <p className="text-xs text-gray-600 font-bold flex items-center gap-1">
                                <span className="text-[#FF6B6B] font-black">🎯 Goal:</span> {item.tujuan}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-gray-500 italic">Detail pertemuan tersedia dalam silabus kelas.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
