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
| `VITE_API_PROXY`  | —       | Opsional. Target proxy dev untuk request `/api`, mis. `http://localhost:3000`. |

Contoh mode API sungguhan:

```env
VITE_USE_MOCK=false
VITE_API_URL=/api
VITE_API_PROXY=http://localhost:3000
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
