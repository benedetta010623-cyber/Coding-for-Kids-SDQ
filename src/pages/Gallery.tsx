import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: number;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching gallery:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436] p-6 lg:p-12">
      <Link to="/" className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl border-4 border-black font-black shadow-[4px_4px_0_#FFD93D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter mb-8">
        <ChevronLeft size={20} /> Kembali ke Beranda
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="bg-[#FFD93D] border-2 border-black px-4 py-1 rounded-full font-black text-xs uppercase mb-2 inline-block">Momen Seru Kita</span>
          <h1 className="font-['Fredoka_One'] text-4xl text-[#2D3436] mb-2 flex items-center gap-3">
             <ImageIcon className="w-10 h-10 text-[#FF8C32]" />
             GALERI FOTO
          </h1>
          <p className="font-black text-gray-500 italic max-w-xl">
            Lihat koleksi momen belajar siswa SDQ Al Mahmudah!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
             <Loader2 className="w-16 h-16 animate-spin text-[#FF8C32]" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id} 
                className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_black] group hover:-translate-y-1 hover:shadow-[10px_10px_0px_black] transition-all"
              >
                <div className="block relative aspect-square">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <p className="text-white font-black text-sm truncate w-full">{item.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-dashed border-black rounded-[3rem] p-20 text-center opacity-60">
            <ImageIcon className="w-20 h-20 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-black mb-2">Belum ada foto</h3>
            <p className="font-bold">Galeri ini masih kosong, segera akan diisi!</p>
          </div>
        )}
      </div>
    </div>
  );
}
