import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { initAuth, googleSignIn, getAccessToken } from '../lib/googleAuth';
import { ChevronLeft, LogIn, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DriveFile {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  webViewLink: string;
}

export default function Gallery() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, t) => {
        setToken(t);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!needsAuth && token) {
      fetchFiles(token);
    }
  }, [needsAuth, token]);

  const fetchFiles = async (accessToken: string) => {
    setLoadingFiles(true);
    setError('');
    try {
      // Fetch files explicitly requested with image mimeTypes
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType contains 'image/' and trashed = false&fields=files(id,name,thumbnailLink,webContentLink,webViewLink)&pageSize=30`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch files from Google Drive');
      }
      
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat foto. Harap pastikan akses Google Drive diizinkan.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Gagal masuk dengan Google. Coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#2D3436] p-6 lg:p-12">
      <Link to="/" className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl border-4 border-black font-black shadow-[4px_4px_0_#FFD93D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter mb-8">
        <ChevronLeft size={20} /> Kembali ke Beranda
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <span className="bg-[#FFD93D] border-2 border-black px-4 py-1 rounded-full font-black text-xs uppercase mb-2 inline-block">Momen Seru Kita</span>
            <h1 className="font-['Fredoka_One'] text-4xl text-[#2D3436] mb-2 flex items-center gap-3">
               <ImageIcon className="w-10 h-10 text-[#FF8C32]" />
               GALERI FOTO SISWA
            </h1>
            <p className="font-black text-gray-500 italic max-w-xl">
              Lihat koleksi foto kegiatan, project, dan momen belajar siswa SDQ Al Mahmudah langsung dari Google Drive.
            </p>
          </div>
        </div>

        {error && (
            <div className="bg-[#FF6B6B] text-white border-4 border-black p-4 rounded-xl font-black mb-8 shadow-[4px_4px_0px_black]">
              {error}
            </div>
        )}

        {needsAuth ? (
          <div className="bg-white border-4 border-black p-10 rounded-[3rem] shadow-[12px_12px_0px_#4ECDC4] text-center max-w-2xl mx-auto py-20">
            <div className="w-20 h-20 bg-[#FFE66D] border-4 border-black rounded-3xl mx-auto flex items-center justify-center -rotate-6 mb-6 shadow-[6px_6px_0px_black]">
                <ImageIcon size={40} className="text-[#2D3436]" />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase">Akses Keamanan Galeri</h2>
            <p className="text-gray-600 font-bold mb-8 italic">
              Kamu perlu masuk menggunakan akun Google untuk dapat melihat foto-foto yang tersimpan di Google Drive.
            </p>

            <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button mx-auto disabled:opacity-50"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper bg-white px-6 py-3 border-4 border-black rounded-xl shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all text-[#2D3436] font-black flex items-center gap-3 cursor-pointer">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style={{display: 'block', width: '24px'}}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents uppercase tracking-widest">{isLoggingIn ? 'MEMUAT...' : 'SIGN IN DENGAN GOOGLE'}</span>
                <span style={{display: 'none'}}>Sign in with Google</span>
              </div>
            </button>
          </div>
        ) : (
          <div>
            {loadingFiles ? (
              <div className="flex justify-center items-center py-32">
                 <Loader2 className="w-16 h-16 animate-spin text-[#FF8C32]" />
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={file.id} 
                    className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_black] group hover:-translate-y-1 hover:shadow-[10px_10px_0px_black] transition-all"
                  >
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="block relative aspect-square">
                      {file.thumbnailLink ? (
                        <img 
                          src={file.thumbnailLink.replace('=s220', '=s600')} 
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                         <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="text-gray-400 w-12 h-12" />
                         </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                         <p className="text-white font-black text-xs truncate w-full">{file.name}</p>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-4 border-dashed border-black rounded-[3rem] p-20 text-center opacity-60">
                <ImageIcon className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-black mb-2">Belum ada foto</h3>
                <p className="font-bold">Tidak ada foto ditemukan di Google Drive kamu.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
