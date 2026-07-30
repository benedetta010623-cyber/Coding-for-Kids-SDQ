<div align="center">
  <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop" width="1200" height="475" alt="Coding Kids SDQ Banner" />
</div>

# SDQ Coding Portal 🚀

Selamat datang di portal pembelajaran coding untuk siswa SDQ Al Mahmudah! Platform ini dirancang untuk memamerkan karya terbaik siswa dan mengelola modul pembelajaran.

## Fitur Utama
- **Gallery Karya**: Menampilkan game, animasi, dan website buatan siswa.
- **Portal Siswa**: Dashboard bagi siswa untuk mengunggah proyek mereka.
- **Panel Admin**: Manajemen modul kurikulum dan persetujuan karya siswa.

## Cara Menjalankan Secara Lokal

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setting Environment**:
   Salin `.env.example` ke `.env` dan isi variabel yang diperlukan.
3. **Jalankan Aplikasi**:
   ```bash
   npm run dev
   ```

## Panduan Foto Profil Siswa (Real Student Avatars)

Untuk menggunakan foto asli siswa agar website tetap ringan dan cepat:
1. **Kompres & Potong Foto**: Potong foto menjadi persegi 300x300 px atau 512x512 px.
2. **Format WebP**: Simpan foto dalam format `.webp` (target ukuran file: 20–80 KB).
3. **Simpan di Folder**: Masukkan file gambar ke folder `public/avatars/` (contoh: `public/avatars/alkholifi.webp`).
4. **Atur di Form Admin / Firestore**: Pada input **URL Foto Siswa Ringan / WebP**, isi dengan `/avatars/nama-siswa.webp` (atau URL Cloud Storage/Cloudinary jika menggunakan CDN).
5. **Fallback**: Jika foto tidak diisi atau gagal dimuat, sistem otomatis menggunakan avatar DiceBear.

## Checklist Keamanan & Pengeluaran Production

- [x] Route `/init` dibatasi khusus lingkungan pengembangan (`import.meta.env.DEV`) & diblokir di produksi.
- [x] Aturan keamanan Firestore (`firestore.rules`) diperbarui: pendaftaran akun admin dari sisi client ditutup (`allow write: if false`).
- [x] Tidak ada kredensial admin default yang terekspos secara publik di produksi.
- [x] Gambar avatar menggunakan pemuatan ringan (`loading="lazy"`, `decoding="async"`, dan `referrerPolicy="no-referrer"`).
- [x] Verifikasi build & linter lulus tanpa error (`npm run lint` & `npm run build`).

---
Dibuat dengan ❤️ untuk masa depan digital siswa SDQ Al Mahmudah.
