import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, ChevronLeft, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatImageUrl } from '../lib/utils';

export default function GalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubGallery = onSnapshot(qGallery, (snapshot) => {
      setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubGallery();
  }, []);

  const handleLike = async (item: any) => {
    if (!user) {
      alert("Kamu harus login untuk menyukai postingan!");
      return;
    }
    const itemRef = doc(db, 'gallery', item.id);
    const hasLiked = item.likes?.includes(user.uid);
    try {
      if (hasLiked) {
        await updateDoc(itemRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(itemRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error liking item:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !selectedItem || !commentText.trim()) return;

    const itemRef = doc(db, 'gallery', selectedItem.id);
    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: profile.name,
      text: commentText,
      createdAt: new Date().toISOString()
    };

    try {
      await updateDoc(itemRef, {
        comments: arrayUnion(newComment)
      });
      setCommentText('');
      // update selected item locally to reflect immediately or let snapshot handle it if modal is reopened
      const updatedItem = { ...selectedItem, comments: [...(selectedItem.comments || []), newComment] };
      setSelectedItem(updatedItem);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">MEMUAT GALLERY...</div>;

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436]">
      {/* Header Nav */}
      <div className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col items-center">
        <div className="w-full flex justify-between items-center bg-white p-4 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#4ECDC4] mb-12">
           <Link to="/" className="inline-flex items-center gap-2 bg-[#F3F4F6] px-6 py-3 rounded-xl border-2 border-black font-black hover:bg-[#FFD93D] transition-colors uppercase text-sm">
             <ChevronLeft size={20} /> KEMBALI
           </Link>
           <h1 className="font-['Fredoka_One'] text-2xl md:text-3xl uppercase tracking-widest hidden md:block">Gallery Kegiatan</h1>
           <div className="px-6 py-3 border-2 border-black rounded-xl font-black text-sm uppercase bg-[#FFE66D]">
             MOMENT ✨
           </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gallery.map(item => {
            const hasLiked = user && item.likes?.includes(user.uid);
            return (
              <motion.div 
                key={item.id} 
                whileHover={{ y: -5 }}
                className="bg-white border-4 border-black rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_black] group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="h-64 bg-gray-100 border-b-4 border-black overflow-hidden relative">
                  <img 
                    src={formatImageUrl(item.imageUrl)} 
                    alt={item.title} 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0_black]">
                     {new Date(item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-['Fredoka_One'] text-xl mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-500 font-bold text-sm mb-6 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center gap-4 border-t-2 border-dashed border-gray-200 pt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(item); }} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black font-black text-sm transition-all ${hasLiked ? 'bg-[#FF6B6B] text-white shadow-[2px_2px_0_black]' : 'bg-gray-50 hover:bg-[#FFE66D]'}`}
                    >
                      <Heart size={16} className={hasLiked ? 'fill-white' : ''} /> {item.likes?.length || 0}
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black font-black text-sm bg-gray-50 hover:bg-[#4ECDC4] transition-all">
                      <MessageCircle size={16} /> {item.comments?.length || 0}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {gallery.length === 0 && (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-black rounded-[3rem] opacity-50 bg-white">
              <p className="text-2xl font-black italic">Belum ada kegiatan yang diunggah.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Detail View */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black w-full max-w-4xl rounded-[2.5rem] shadow-[16px_16px_0px_black] overflow-hidden flex flex-col md:flex-row my-auto"
            >
              {/* Image Section */}
              <div className="w-full md:w-3/5 bg-black relative flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-black min-h-[300px]">
                <img 
                  src={formatImageUrl(selectedItem.imageUrl)} 
                  alt={selectedItem.title} 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain md:object-cover max-h-[60vh] md:max-h-none" 
                />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 left-4 bg-white p-2 rounded-xl border-2 border-black shadow-[4px_4px_0_black] hover:scale-105 z-10 md:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Interaction Section */}
              <div className="w-full md:w-2/5 flex flex-col h-[50vh] md:h-[70vh] bg-[#FFF9F2]">
                {/* Header */}
                <div className="p-6 border-b-4 border-black bg-white flex justify-between items-start shrink-0">
                  <div>
                    <h3 className="font-['Fredoka_One'] text-2xl uppercase">{selectedItem.title}</h3>
                    <p className="text-sm font-bold text-gray-500 mt-2 leading-relaxed">{selectedItem.description}</p>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="hidden md:flex bg-gray-100 p-2 rounded-xl border-2 border-black hover:bg-[#FF6B6B] hover:text-white transition-colors shrink-0 ml-4"><X size={20} /></button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {(selectedItem.comments || []).length === 0 ? (
                    <p className="text-center text-sm font-bold text-gray-400 italic py-10">Belum ada komentar.</p>
                  ) : (
                    (selectedItem.comments || []).map((c: any) => (
                      <div key={c.id} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[2px_2px_0_black]">
                        <p className="font-black text-xs text-[#4ECDC4] mb-1">{c.userName}</p>
                        <p className="font-bold text-sm text-gray-800">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Bar */}
                <div className="p-4 border-t-4 border-black bg-white shrink-0">
                  <div className="flex items-center gap-4 mb-4">
                     <button 
                       onClick={() => handleLike(selectedItem)} 
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black font-black text-sm transition-all ${user && selectedItem.likes?.includes(user.uid) ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_0_black]' : 'bg-gray-100'}`}
                     >
                       <Heart size={20} className={user && selectedItem.likes?.includes(user.uid) ? 'fill-white' : ''} /> {selectedItem.likes?.length || 0}
                     </button>
                  </div>
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={user ? "Tambahkan komentar..." : "Login untuk komentar"}
                      disabled={!user}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-[#F3F4F6] border-2 border-black p-3 rounded-xl font-bold text-sm outline-none focus:bg-white"
                    />
                    <button 
                      type="submit" 
                      disabled={!user || !commentText.trim()}
                      className="bg-[#FFE66D] px-4 rounded-xl border-2 border-black text-black shadow-[3px_3px_0_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
