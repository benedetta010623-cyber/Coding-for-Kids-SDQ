import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Gamepad2, FileText, Image as ImageIcon, ExternalLink, Award, Rocket, Folder } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAvatarUrl, handleAvatarError } from '../lib/avatar';

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch student info
      const fetchStudent = async () => {
        try {
          const studentDoc = await getDoc(doc(db, 'students', id));
          if (studentDoc.exists()) {
            setStudent({ id: studentDoc.id, ...studentDoc.data() });
          }
        } catch (error) {
          console.error("Error fetching student:", error);
        }
      };

      // Fetch approved projects
      const q = query(
        collection(db, 'projects'),
        where('studentId', '==', id),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });

      fetchStudent();
      return unsubscribe;
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">MEMUAT PROFIL...</div>;

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-['Nunito']">
        <h1 className="font-['Fredoka_One'] text-4xl mb-4 uppercase">Siswa Tidak Ditemukan</h1>
        <p className="mb-8 font-black italic opacity-70">Maaf, profil ini belum tersedia.</p>
        <Link to="/" className="bg-[#FFD93D] px-10 py-4 rounded-2xl border-4 border-black font-black shadow-[8px_8px_0_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          KEMBALI KE BERANDA
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436] pb-20">
      {/* Header Nav */}
      <div className="max-w-4xl mx-auto p-6">
        <Link to="/" className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-2xl border-4 border-black font-black shadow-[6px_6px_0_#FFD93D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter">
          <ChevronLeft size={20} /> Kembali Ke Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Profile Head Card */}
        <div className="relative bg-white border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0_#4ECDC4] overflow-hidden mb-12">
          {/* Cover Background */}
          <div className="h-40 bg-[#FFE66D] border-b-4 border-black flex items-center justify-center">
             <div className="bg-white border-2 border-black px-4 py-1 rounded-lg font-black text-sm rotate-1 shadow-[3px_3px_0px_black]">WARRIOR PROFILE</div>
          </div>
          
          <div className="px-8 pb-10 text-center -mt-20">
            <div className="w-40 h-40 mx-auto rounded-full border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_black] mb-6 relative z-10">
              <img 
                src={student.avatarUrl || getAvatarUrl(student.name, student.gender || 'L')} 
                alt={student.name} 
                onError={(e) => handleAvatarError(e, student.name, student.gender)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            
            <h1 className="font-['Fredoka_One'] text-3xl md:text-5xl mb-4 uppercase">{student.name}</h1>
            <div className="inline-block bg-[#FF6B6B] text-white border-4 border-black px-8 py-2 rounded-2xl font-black text-lg shadow-[6px_6px_0px_black] mb-8">
              KELAS {student.class} • ANGKATAN 2024
            </div>
            
            <p className="text-xl font-black italic max-w-2xl mx-auto mb-10 text-gray-800 leading-relaxed">
              "{student.bio}"
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Badge color="orange" icon={<Award size={20} />} text="TELADAN" />
              <Badge color="green" icon={<Rocket size={20} />} text="SCRATCH MASTER" />
              <Badge color="blue" icon={<Folder size={20} />} text={`${projects.length} PROJECTS`} />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-3 h-10 bg-[#FF8C32] border-4 border-black rounded-full" />
            <h2 className="font-['Fredoka_One'] text-3xl uppercase">PROJECT GALLERY</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.length > 0 ? (
              projects.map((project) => (
                <motion.div 
                  key={project.id}
                  whileHover={{ y: -8, x: 4 }}
                  className="bg-white border-4 border-black rounded-[2rem] overflow-hidden shadow-[10px_10px_0_#FFD93D]"
                >
                  <div className="h-48 bg-[#F3F4F6] border-b-4 border-black overflow-hidden relative group">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white p-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_black]">
                      {project.type === 'scratch' ? <Gamepad2 size={24} /> : project.type === 'image' ? <ImageIcon size={24} /> : <FileText size={24} />}
                    </div>
                  </div>
                  <div className="p-8">
                    <span className="bg-[#4ECDC4] border-2 border-black rounded-lg px-3 py-1 font-black text-[10px] tracking-widest uppercase shadow-[3px_3px_0px_black]">{project.category}</span>
                    <h3 className="font-['Fredoka_One'] text-2xl mt-4 mb-3 uppercase tracking-tighter">{project.title}</h3>
                    <p className="text-gray-600 font-black text-sm mb-8 leading-normal">
                      {project.description}
                    </p>
                    <a 
                      href={project.link || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#FF8C32] text-white py-4 rounded-2xl border-4 border-black font-black text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[6px_6px_0px_black]"
                    >
                      {project.type === 'scratch' ? 'PLAY GAME' : project.type === 'image' ? 'VIEW ART' : 'OPEN PROJECT'}
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-white border-4 border-dashed border-black rounded-[2.5rem] p-24 text-center">
                <div className="w-20 h-20 bg-[#F3F4F6] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket size={40} className="text-black opacity-30" />
                </div>
                <p className="text-xl font-black italic text-gray-300">Belum ada project yang diunggah. Semangat!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ color, icon, text }: { color: 'orange' | 'green' | 'blue', icon: React.ReactNode, text: string }) {
  const colors = {
    orange: 'bg-[#FFF4E6] text-[#FF9F43]',
    green: 'bg-[#E8F5E9] text-[#2ECC71]',
    blue: 'bg-[#E3F2FD] text-[#3498DB]'
  };
  
  return (
    <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl border-2 border-black font-extrabold shadow-[4px_4px_0_rgba(0,0,0,0.1)] ${colors[color]}`}>
      {icon} {text}
    </div>
  );
}
