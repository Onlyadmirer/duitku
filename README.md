# Duitku

Frontend aplikasi pencatatan keuangan pribadi dengan pendekatan **mobile-first**. Semua kontrak API mengikuti dokumen `API.md` (spesifikasi proyek).

## Fitur

- Autentikasi: login, registrasi, proteksi route, dan logout.
- Beranda: total saldo, pemasukan/pengeluaran bulan berjalan, anggaran, tren 12 bulan, transaksi terbaru.
- Transaksi: pencarian, filter, pagination, detail, tambah, edit, dan hapus.
- Anggaran: batas per kategori, progres pemakaian, peringatan over-budget, tambah/edit/hapus.
- Laporan: ringkasan arus kas, donut pengeluaran per kategori, tren bulanan, dan tabel fallback untuk chart.
- Dompet dan kategori: CRUD lengkap.
- Lainnya: profil, mode gelap/terang/sistem, reset data demo, dan logout.
- Loading, empty, error state, serta toast untuk feedback aksi.
- Mode demo memakai data mock persisten di `localStorage`, tanpa backend.

## Stack

- React 19 + TypeScript + Vite
- TanStack Router (route berbasis kode)
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS v4 + komponen shadcn/Base UI
- Recharts
- Axios
- Sonner

## Menjalankan

```bash
bun install       # atau npm install
cp .env.example .env
bun run dev       # atau npm run dev
```

Buka `http://localhost:5173`.

> `.env.example` hanyalah template. Vite hanya membaca `.env`, `.env.local`, dan varian per-mode, jadi konfigurasi harus ditulis di `.env`. Setelah mengubah env, hentikan dan jalankan ulang dev server.

### Akun demo

- Email: `demo@duitku.id`
- Password: `password123`

Mode demo aktif secara default dan sesi langsung masuk sebagai akun demo. Untuk melihat halaman login, buka **Lainnya → Keluar dari akun**.
Data demo dapat dikembalikan ke kondisi awal lewat **Lainnya → Reset data demo**.

## Environment

| Variabel          | Default | Keterangan                                                              |
| ----------------- | ------- | ----------------------------------------------------------------------- |
| `VITE_USE_MOCK`   | `true`  | `false` untuk memakai API sungguhan.                                    |
| `VITE_API_URL`    | `/api`  | Base URL API.                                                           |
| `VITE_API_PROXY`  | —       | Opsional, **hanya untuk `vite dev`**. Target proxy request `/api`, mis. `http://localhost:3000`. Tidak dipakai saat build/preview. |

Contoh mode API sungguhan untuk development lokal:

```env
VITE_USE_MOCK=false
VITE_API_URL=/api
VITE_API_PROXY=http://localhost:3000
```

Dengan konfigurasi ini browser memanggil `/api` di origin yang sama, lalu Vite meneruskannya ke backend. Ini penting agar cookie `httpOnly` tetap dianggap first-party.

## Deploy ke Vercel

Repo ini menyertakan `vercel.json` yang:

- meneruskan `/api/*` ke `https://duitku-api-psi.vercel.app/api/*`, sehingga request tetap same-origin dan cookie sesi ikut terkirim;
- mengarahkan route lain ke `index.html` agar halaman seperti `/laporan` atau `/transaksi/$id` tidak 404 saat di-refresh.

### Environment di dashboard Vercel

Set untuk **Production** dan **Preview**:

| Key             | Value   |
| --------------- | ------- |
| `VITE_USE_MOCK` | `false` |
| `VITE_API_URL`  | `/api`  |

Jangan mengisi `VITE_API_PROXY` di Vercel — variabel itu hanya dibaca oleh dev server. Nilai env ditanam saat build, jadi lakukan redeploy setelah mengubahnya.

### Build settings

- Framework Preset: **Vite**
- Install Command: `bun install --frozen-lockfile`
- Build Command: `bun run build`
- Output Directory: `dist`
- Node.js Version: 22.x

### Catatan

- `vercel.json` berfungsi sebagai proxy same-origin. Jangan mengganti `VITE_API_URL` menjadi URL API penuh kecuali backend mengirim cookie `SameSite=None; Secure` dan mengizinkan CORS domain frontend.
- Jika domain API berubah, cukup ubah `destination` pada rewrite `/api/:path*`.

## PWA

Aplikasi dapat dipasang di layar utama (Android/Chrome, desktop, dan iOS lewat **Share → Add to Home Screen**).

- `vite-plugin-pwa` membuat `manifest.webmanifest` dan service worker `sw.js` saat build.
- Service worker hanya menyimpan app shell dan aset statis. Request `/api/*` **tidak pernah di-cache** agar data dan cookie autentikasi selalu segar.
- Offline: aplikasi tetap terbuka, tetapi data keuangan memerlukan jaringan dan akan menampilkan error state.
- Tombol **Lainnya → Instal aplikasi** muncul otomatis saat browser menawarkan pemasangan, dan disembunyikan jika aplikasi sudah berjalan dalam mode standalone.

Service worker tidak aktif di `vite dev`. Untuk menguji PWA:

```bash
bun run build
bun run preview
```

`vite preview` memakai proxy `VITE_API_PROXY` yang sama, jadi API tetap berfungsi saat pengujian lokal.

### Ikon

Ikon PWA dan favicon dibuat dari `public/image.png`:

| File                              | Ukuran  | Kegunaan           |
| --------------------------------- | ------- | ------------------ |
| `public/icons/icon-192.png`       | 192×192 | Android/desktop    |
| `public/icons/icon-512.png`       | 512×512 | Splash & install   |
| `public/icons/icon-maskable-512.png` | 512×512 | Android adaptive |
| `public/icons/apple-touch-icon.png`  | 180×180 | iOS home screen  |
| `public/icons/favicon-32.png`     | 32×32   | Favicon browser    |

Regenerasi ikon (butuh Python + Pillow):

```bash
pip install pillow
python scripts/generate-icons.py
```

## Integrasi API

- Autentikasi memakai cookie `httpOnly`; frontend tidak membaca token dan selalu mengirim request dengan `withCredentials: true`.
- Request yang mendapat `401` mencoba rotasi sesi lewat `POST /auth/refresh`, lalu mengulang request sekali.
- Respons sukses `{ success: true, data }` di-unwrap oleh interceptor.
- Respons error `{ error: { code, message, fields } }` dipetakan ke `ApiError`.
- Bentuk respons daftar dan laporan dinormalisasi agar toleran terhadap variasi `array` atau `{ items }`.
- Nominal menggunakan integer Rupiah, tanggal transaksi `YYYY-MM-DD`, dan bulan anggaran `YYYY-MM`.

## Route

| Route             | Halaman                          |
| ----------------- | -------------------------------- |
| `/masuk`          | Login                            |
| `/daftar`         | Registrasi                       |
| `/`               | Beranda                          |
| `/transaksi`      | Daftar & filter transaksi        |
| `/transaksi/baru` | Tambah transaksi                 |
| `/transaksi/$id`  | Edit transaksi                   |
| `/anggaran`       | Anggaran                         |
| `/laporan`        | Laporan                          |
| `/dompet`         | Dompet                           |
| `/kategori`       | Kategori                         |
| `/lainnya`        | Pengaturan dan profil            |

Semua route selain `/masuk` dan `/daftar` dilindungi guard yang memverifikasi sesi lewat `GET /me`.

## Struktur

```text
src/
├─ components/
│  ├─ app/          # komponen bersama (state, header, ikon, dsb.)
│  ├─ charts/       # chart Recharts + fallback tabel
│  └─ ui/           # primitif shadcn/Base UI
├─ hooks/           # query & mutation TanStack Query
├─ layouts/         # shell aplikasi dan bottom navigation
├─ lib/
│  ├─ mock/         # adapter Axios + seed data demo
│  ├─ api.ts        # client API dan normalizer
│  ├─ format.ts     # format Rupiah/tanggal/bulan
│  └─ theme.tsx     # theme provider light/dark/system
├─ pages/           # halaman per fitur
├─ types/           # tipe kontrak API
├─ main.tsx
└─ router.tsx
```

## Script

```bash
bun run dev       # development server
bun run build     # type-check + production build
bun run lint      # ESLint
bun run preview   # preview hasil build
```

Semua perintah juga bisa dijalankan dengan `npm run <nama-script>`.

## Catatan aksesibilitas

- Chart memiliki ringkasan teks dan tabel data tersembunyi secara visual sebagai fallback.
- Navigasi bawah memakai label teks, status aktif, dan area sentuh yang memadai.
- Dialog, sheet, dan menu memakai primitif Base UI yang mendukung keyboard serta focus management.
