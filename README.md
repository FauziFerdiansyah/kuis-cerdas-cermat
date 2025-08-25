# 🧠 LCC - Aplikasi Kuis Cerdas Cermat

Aplikasi web kuis cerdas cermat yang modern dan interaktif, dibangun dengan Next.js dan terintegrasi dengan Supabase.

## ✨ Fitur Utama

- 🎯 **4 Level Kesulitan**: Test, Mudah, Sedang, Sulit
- ⚡ **Koreksi Instan**: Toggle untuk melihat jawaban benar secara langsung
- 🏆 **Leaderboard Interaktif**: Papan peringkat dengan detail pemain
- ⏱️ **Timer Real-time**: Waktu pengerjaan yang terus berjalan
- 📊 **Progress Bar**: Indikator kemajuan kuis
- 🎨 **UI Modern**: Desain gradient dengan animasi dan efek blur
- 📱 **Responsive**: Tampilan optimal di semua perangkat

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React (Feather Icons)
- **Animasi**: Framer Motion
- **Deployment**: GitHub Pages

## 🚀 Cara Menjalankan Proyek

### Prasyarat
- Node.js 18 atau lebih baru
- npm atau yarn
- Akun Supabase

### Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd lcc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Buat file `.env.local` di root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup database Supabase**
   
   Jalankan SQL berikut di Supabase SQL Editor:
   
   ```sql
   -- Buat tipe data custom
   CREATE TYPE difficulty_level AS ENUM ('Mudah', 'Sedang', 'Sulit', 'Test');
   CREATE TYPE subject_category AS ENUM ('Sejarah', 'Matematika', 'Fisika', 'Kimia', 'Biologi');
   CREATE TYPE correct_option AS ENUM ('A', 'B', 'C', 'D');
   
   -- Tabel questions
   CREATE TABLE questions (
     id SERIAL PRIMARY KEY,
     question_text TEXT NOT NULL,
     level difficulty_level NOT NULL,
     subject subject_category NOT NULL,
     option_a TEXT NOT NULL,
     option_b TEXT NOT NULL,
     option_c TEXT NOT NULL,
     option_d TEXT NOT NULL,
     correct_answer correct_option NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   
   -- Tabel leaderboard
   CREATE TABLE leaderboard (
     id SERIAL PRIMARY KEY,
     player_name VARCHAR(255) NOT NULL,
     level difficulty_level NOT NULL,
     score INT NOT NULL,
     time_taken_seconds INT NOT NULL,
     submitted_at TIMESTAMPTZ DEFAULT now()
   );
   
   -- Index untuk performa
   CREATE INDEX idx_leaderboard_level_score_time ON leaderboard (level, score DESC, time_taken_seconds ASC);
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📦 Build untuk Production

```bash
npm run build
```

File hasil build akan tersimpan di folder `out/` dan siap untuk di-deploy ke GitHub Pages.

## 🌐 Deployment ke GitHub Pages

1. **Setup GitHub Repository**
   - Push kode ke GitHub repository
   - Aktifkan GitHub Pages di Settings > Pages
   - Pilih "GitHub Actions" sebagai source

2. **Setup Secrets**
   
   Tambahkan secrets berikut di GitHub repository (Settings > Secrets and variables > Actions):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   
   Push ke branch `main` akan otomatis trigger deployment melalui GitHub Actions.

## 📁 Struktur Proyek

```
lcc/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── leaderboard/     # Halaman leaderboard
│   │   ├── player-name/     # Halaman input nama
│   │   ├── quiz/           # Halaman kuis
│   │   ├── results/        # Halaman hasil
│   │   └── page.tsx        # Halaman utama
│   ├── components/         # Komponen React
│   │   ├── ui/            # Komponen UI dasar
│   │   └── Layout.tsx     # Layout utama
│   └── lib/               # Utilities dan konfigurasi
│       └── supabase.ts    # Konfigurasi Supabase
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions workflow
├── .env.local            # Environment variables
├── next.config.js        # Konfigurasi Next.js
└── tailwind.config.js    # Konfigurasi Tailwind CSS
```

## 🎮 Cara Menggunakan Aplikasi

1. **Pilih Level**: Pilih salah satu dari 4 level kesulitan
2. **Toggle Koreksi**: Aktifkan jika ingin melihat jawaban benar langsung
3. **Input Nama**: Masukkan nama pemain
4. **Mulai Kuis**: Jawab pertanyaan dengan timer berjalan
5. **Lihat Hasil**: Cek skor dan waktu pengerjaan
6. **Leaderboard**: Lihat peringkat dan detail pemain lain

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat issue atau pull request.

## 📄 Lisensi

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

**Dibuat dengan ❤️ menggunakan Next.js dan Supabase**
