# Warga Sendut — Dashboard Warga RT 07 / RW 03

Full-screen Next.js app untuk mengelola iuran RT dengan 2-step login flow dan dashboard.

## Setup

### 1. Database (MariaDB)

Pastikan MariaDB sudah berjalan, lalu update `.env.local` sesuai kredensial:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wargasendut
```

Kemudian seed database:

```bash
npm run setup-db
```

Ini akan membuat tabel dan insert data dummy:
- **pak_rt_07** / **warga123** (Ketua RT)
- **bu_bendahara** / **warga123** (Bendahara)
- **pak_ketua_rw** / **warga123** (Ketua RW)

### 2. Development

```bash
npm run dev
```

Akses http://localhost:3000/masuk — login dengan salah satu akun demo di atas.

## Fitur

### Login Flow (`/masuk`)
- **Step 1:** Input username → cek di database
- **Step 2:** Input password dengan sapaan personal ("Hai, Pak Slamet!")
- **Loading state:** Animasi spinner
- **Success:** Konfirmasi + auto-redirect ke dashboard
- Error handling: Username tidak ditemukan, password salah dengan attempt counter (max 5, lockout 15 menit)

### Dashboard (`/`)
- Sidebar navigasi (6 menu items)
- Welcome card dengan statistik iuran
- Stats grid: Terkumpul, Sudah bayar, Tertunggak
- Tabel daftar iuran warga
- Profile + logout

## Tech Stack

- **Next.js 16** dengan App Router
- **React 19** & TypeScript
- **MariaDB** (MySQL-compatible)
- **iron-session** untuk session management
- **bcryptjs** untuk password hashing
- Pure CSS (no Tailwind) — custom design system

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Design tokens & components
│   ├── page.tsx            # Dashboard (/)
│   ├── masuk/page.tsx      # Login flow (/masuk)
│   └── api/
│       └── auth/
│           ├── check-username/route.ts
│           ├── login/route.ts
│           └── logout/route.ts
│       └── dashboard/route.ts
├── lib/
│   ├── db.ts               # MySQL connection pool
│   ├── session.ts          # iron-session config
│   └── auth.ts             # Auth utilities (bcrypt)
└── components/             # (future components)

db/
├── schema.sql              # Table definitions
scripts/
└── setup-db.ts             # DB init script
```

## API Routes

### POST `/api/auth/check-username`
```json
{ "username": "pak_rt_07" }
→ { "found": true, "displayName": "Pak Slamet", "honorific": "Pak Slamet", "role": "Ketua RT 07" }
```

### POST `/api/auth/login`
```json
{ "username": "pak_rt_07", "password": "warga123" }
→ { "success": true, "displayName": "Pak Slamet", "honorific": "Pak Slamet" }
```

### POST `/api/auth/logout`
```json
→ { "success": true }
```

### GET `/api/dashboard`
```json
→ {
  "displayName": "Pak Slamet",
  "bulan": "April",
  "tahun": 2026,
  "warga": [
    { "display_name": "Pak Slamet", "nomor_rumah": 7, "status": "lunas" },
    ...
  ]
}
```

## Database Schema

```sql
warga
  ├─ id, username (UNIQUE), password_hash
  ├─ display_name, honorific, role
  ├─ nomor_rumah, rt, rw
  └─ is_active, created_at, updated_at

iuran
  ├─ id, warga_id (FK)
  ├─ bulan, tahun
  ├─ jumlah, status (lunas/belum/terlambat)
  ├─ tanggal_bayar
  └─ created_at, updated_at

login_attempts
  ├─ id, username, ip_address
  ├─ success (for lockout logic)
  └─ created_at
```

## Build

```bash
npm run build
npm start
```

## Notes

- Session menggunakan iron-session dengan HTTP-only cookies
- Password di-hash dengan bcryptjs (10 rounds)
- Login attempts tracked untuk lockout protection (5 salah → 15 menit lock)
- Full-screen responsive design
- Nama warga, honorific (Pak/Bu), dan foto profile bisa di-customize di database
