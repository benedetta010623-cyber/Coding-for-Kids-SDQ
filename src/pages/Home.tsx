import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, Rocket, Brain, Palette, Monitor, ChevronRight, Mail, Instagram, MessageCircle, LogIn } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import Curriculum from '../components/Curriculum';
import { getAvatarUrl, getStudentAvatarSrc, handleAvatarError } from '../lib/avatar';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headline = "PROJECT SHOWCASE SDQ AL MAHMUDAH";

  useEffect(() => {
    // Fetch students
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching students:", error));

    // Fetch approved projects
    const qProjects = query(collection(db, 'projects'), where('status', '==', 'approved'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    let i = 0;
    const interval = setInterval(() => {
      setTypedText(headline.slice(0, i));
      i++;
      if (i > headline.length) clearInterval(interval);
    }, 80);

    return () => {
      clearInterval(interval);
      unsubStudents();
      unsubProjects();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436]">
      {/* Navbar */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4 mt-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-[8px_8px_0px_#FFD93D] border-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FF6B6B] border-2 border-black rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-black rotate-45 bg-white"></div>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-black font-['Fredoka_One'] uppercase">SDQ CODING PORTAL</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="hidden md:flex items-center gap-2 bg-[#FFD93D] border-2 border-black px-4 py-2 rounded-xl font-black text-sm shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <LogIn size={16} /> LOGIN SISWA
            </Link>
            <button 
              className="md:hidden p-2 border-2 border-black rounded-lg bg-[#FFD93D]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <ul className={cn(
            "fixed md:static top-28 right-4 h-auto w-64 md:w-auto bg-white md:bg-transparent flex flex-col md:flex-row gap-4 p-8 md:p-0 border-4 border-black md:border-none rounded-[2rem] md:rounded-none transition-all duration-300 z-50 shadow-[8px_8px_0px_black] md:shadow-none",
            isMenuOpen ? "right-4" : "-right-full md:right-0"
          )}>
            <li className="md:hidden">
              <Link 
                to="/login"
                className="px-4 py-3 bg-[#FFD93D] border-2 border-black rounded-full font-bold text-sm shadow-[4px_4px_0px_black] block text-center mb-4"
                onClick={() => setIsMenuOpen(false)}
              >
                LOGIN SISWA
              </Link>
            </li>
            {['Beranda', 'Kurikulum', 'Siswa', 'Karya', 'Gallery'].map((item) => (
              <li key={item}>
                {item === 'Gallery' ? (
                  <Link 
                    to="/gallery"
                    className="px-4 py-2 bg-[#FF6B6B] text-white border-2 border-black rounded-full font-bold text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    GALLERY ✨
                  </Link>
                ) : (
                  <a 
                    href={`#${item.toLowerCase()}`}
                    className="px-4 py-2 bg-[#4ECDC4] border-2 border-black rounded-full font-bold text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.toUpperCase()}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section id="beranda" className="px-6 py-20">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 bg-[#FFE66D] border-4 border-black p-10 rounded-[2.5rem] shadow-[12px_12px_0px_#FF8C32]">
            <h1 className="font-['Fredoka_One'] text-4xl md:text-6xl mb-6 text-black bg-white px-4 py-2 border-4 border-black rounded-2xl inline-block">
              {typedText}
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-black leading-tight">
              Belajar logika, kreativitas, dan teknologi sejak dini dengan cara yang menyenangkan!
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#karya" 
                className="inline-block bg-[#FF8C32] text-white px-10 py-5 rounded-2xl border-4 border-black font-black text-2xl shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                LIHAT KARYA KAMI 🚀
              </a>
              <Link 
                to="/gallery" 
                className="inline-block bg-[#FF6B6B] text-white px-10 py-5 rounded-2xl border-4 border-black font-black text-2xl shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                GALLERY KEGIATAN 📸
              </Link>
              <Link 
                to="/login"
                className="inline-block bg-white text-black px-10 py-5 rounded-2xl border-4 border-black font-black text-2xl shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                LOG IN SISWA 🔑
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[12px_12px_0px_#4ECDC4] flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop" 
              alt="Kids Coding Coding" 
              className="w-full h-full object-cover rounded-3xl border-4 border-black"
            />
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="kurikulum" className="bg-[#B4A7D6]/10">
        <Curriculum />
      </section>

      {/* Projects Showcase */}
      <section id="karya" className="py-20 px-6 bg-[#FF6B6B]/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <span className="bg-[#FFD93D] border-2 border-black px-4 py-1 rounded-full font-black text-xs uppercase mb-2 inline-block">Galeri Karya Terbaik</span>
              <h2 className="font-['Fredoka_One'] text-4xl text-[#2D3436]">EXPLORE HASIL KARYA SISWA</h2>
            </div>
            <p className="font-black text-gray-500 italic max-w-md text-right">Kumpulan game, animasi, dan aplikasi keren buatan murid-murid hebat SDQ Al Mahmudah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={project.id} 
                className="bg-white border-4 border-black rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_black] group"
              >
                <div className="h-48 bg-gray-100 border-b-4 border-black relative overflow-hidden">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white border-2 border-black px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-[2px_2px_0px_black]">
                    {project.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-['Fredoka_One'] text-xl mb-2 line-clamp-1">{project.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-[#4ECDC4] border-2 border-black rounded-full overflow-hidden">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(project.studentName)}`} 
                          alt={project.studentName} 
                          onError={(e) => handleAvatarError(e, project.studentName)}
                          referrerPolicy="no-referrer"
                        />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-500">{project.studentName}</span>
                  </div>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#FFD93D] border-2 border-black py-3 rounded-xl font-black text-xs shadow-[4px_4px_0px_black] hover:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    CEK KARYA 🚀
                  </a>
                </div>
              </motion.div>
            ))}

            {projects.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-black rounded-[3rem] opacity-30">
                 <p className="text-xl font-bold italic">Belum ada karya yang di-publish. Segera hadir!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Students List */}
      <section id="siswa" className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 mb-12">
             <div className="w-12 h-12 bg-[#4ECDC4] border-4 border-black rounded-xl" />
             <h2 className="font-['Fredoka_One'] text-4xl text-[#2D3436]">
               PILIH WARRIOR KAMU!
             </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {students.map((student) => (
              <Link 
                to={`/student/${student.id}`} 
                key={student.id}
                className="group bg-white border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_#FFD93D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 mb-4 rounded-full border-4 border-black overflow-hidden bg-[#FF6B6B]">
                  <img 
                    src={getStudentAvatarSrc(student)} 
                    alt={student.name} 
                    onError={(e) => handleAvatarError(e, student.name, student.gender)}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-black text-sm md:text-base leading-tight mb-2 uppercase">{student.name}</h3>
                <span className="bg-[#4ECDC4] border-2 border-black rounded-full px-4 py-1 text-xs font-black shadow-[3px_3px_0px_black]">
                  KELAS {student.class}
                </span>
                <div className="mt-4 text-xs font-black text-gray-400 group-hover:text-black flex items-center gap-1 transition-colors uppercase tracking-widest">
                  View Profile <ChevronRight size={14} />
                </div>
              </Link>
            ))}

            {students.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-black rounded-[2.5rem] opacity-30">
                 <p className="text-xl font-bold italic">Belum ada siswa yang terdaftar. Ayo semangat!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-white border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0px_black] mb-20">
        <div>
          <p className="text-xs font-black uppercase tracking-tighter mb-2">PROTOTYPE v1 • 2024 VIBE CODING PROJECT</p>
          <p className="text-sm font-black italic">SDQ AL MAHMUDAH - Mencetak Generasi Digital</p>
        </div>
        <div className="flex gap-4">
          <SocialLink icon={<Instagram size={20} />} />
          <SocialLink icon={<Mail size={20} />} />
          <SocialLink icon={<MessageCircle size={20} />} />
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-gradient-to-br from-[#FFD93D] to-[#FFC312] p-8 rounded-[40px] border-4 border-black shadow-[8px_8px_0_#000000] relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="mb-4 text-black">{icon}</div>
        <h3 className="font-['Fredoka_One'] text-2xl mb-2">{title}</h3>
        <p className="text-black/80 font-semibold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function SocialLink({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="w-12 h-12 bg-[#FFD93D] border-2 border-black text-black rounded-full flex items-center justify-center hover:-translate-y-1 hover:shadow-[0_4px_0_#000000] transition-all">
      {icon}
    </a>
  );
}
