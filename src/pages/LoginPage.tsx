import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const email = name.includes('@') 
        ? name.trim() 
        : `${name.toLowerCase().trim().replace(/\s+/g, '.')}@sdq.id`;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Manual check for redirect
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      if (adminDoc.exists()) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError('Login gagal. Pastikan Nama/Email dan Password benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436] flex flex-col items-center justify-center p-6">
      <Link to="/" className="absolute top-8 left-8 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl border-4 border-black font-black shadow-[4px_4px_0_#FFD93D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter">
        <ChevronLeft size={20} /> Kembali
      </Link>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-[#FFE66D] border-4 border-black p-10 rounded-[3rem] shadow-[12px_12px_0px_#FF8C32]"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_black] rotate-3">
             <Lock size={32} />
          </div>
          <h1 className="font-['Fredoka_One'] text-3xl uppercase tracking-tight">Portal Siswa</h1>
          <p className="font-black italic text-gray-700">Masuk untuk mengunggah karyamu 🚀</p>
        </div>

        {error && (
          <div className="bg-[#FF6B6B] text-white border-2 border-black p-4 rounded-xl font-black mb-6 shadow-[4px_4px_0px_black]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_black]">
            <label className="block text-xs font-black mb-2 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Nama Lengkap Sesuai Absen
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Alkholifi Amanullah Zayn"
              className="w-full bg-[#F3F4F6] border-2 border-black p-3 rounded-xl font-black outline-none focus:bg-white transition-colors"
            />
          </div>

          <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_black]">
            <label className="block text-xs font-black mb-2 uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F3F4F6] border-2 border-black p-3 rounded-xl font-black outline-none focus:bg-white transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF8C32] text-white py-5 rounded-2xl border-4 border-black font-black text-xl shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? 'MEMPROSES...' : 'MASUK SEKARANG 🎮'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold opacity-60">
          Lupa password? Hubungi guru ekskul ya!
        </p>
      </motion.div>
    </div>
  );
}
