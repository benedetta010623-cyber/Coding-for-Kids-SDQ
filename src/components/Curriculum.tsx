import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Rocket, Palette, Monitor, Globe, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const iconMap: any = {
  Rocket: <Rocket size={24} />,
  Palette: <Palette size={24} />,
  Monitor: <Monitor size={24} />,
  Globe: <Globe size={24} />
};

export default function Curriculum() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'curriculum'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-block bg-white border-4 border-black p-4 rounded-2xl shadow-[8px_8px_0px_#FFD93D] mb-6">
          <h2 className="font-['Fredoka_One'] text-4xl text-black">📋 KURIKULUM KAMI</h2>
        </div>
        <p className="text-xl font-black text-gray-600 italic">Kurikulum Coding Terstruktur untuk SDQ Al Mahmudah</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Semester 1 */}
        <div className="space-y-8">
          <h3 className="bg-[#FFD93D] border-4 border-black px-6 py-2 rounded-2xl font-black text-xl inline-block shadow-[4px_4px_0px_black]">SEMESTER 1</h3>
          <div className="space-y-6">
            {modules.filter(m => m.semester === 1).map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>

        {/* Semester 2 */}
        <div className="space-y-8">
          <h3 className="bg-[#B4A7D6] border-4 border-black px-6 py-2 rounded-2xl font-black text-xl inline-block shadow-[4px_4px_0px_black]">SEMESTER 2</h3>
          <div className="space-y-6">
            {modules.filter(m => m.semester === 2).map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard(props: any) {
  const { module } = props;
  const isSoon = module.status === 'coming_soon';
  
  return (
    <motion.div 
      whileHover={!isSoon ? { scale: 1.02, x: 5 } : {}}
      className={`bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_black] relative overflow-hidden transition-all ${isSoon ? 'border-dashed opacity-70 scanline' : 'hover:shadow-[12px_12px_24px_rgba(0,0,0,0.1)]'}`}
    >
      <div className="flex gap-6 items-start">
        <div className="w-16 h-16 bg-[#F3F4F6] border-4 border-black rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_black]">
          {iconMap[module.icon] || <BookOpen size={24} />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-['Fredoka_One'] text-2xl uppercase tracking-tighter">
              {module.title}
            </h4>
            {isSoon && (
              <span className="bg-black text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">SOON</span>
            )}
          </div>
          <p className="text-gray-600 font-black leading-relaxed mb-4">
            {module.desc}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[10px] font-black text-[#FF6B6B] bg-[#FFF4E6] px-2 py-1 rounded-lg border-2 border-black">
              <Clock size={12} /> {module.duration}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-[#4ECDC4] italic">
              <ChevronRight size={12} /> {isSoon ? 'Segera hadir' : 'Siap dipelajari'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
