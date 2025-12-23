# Sistem Manajemen Rapor SD - Backend

Node.js & Express backend untuk Sistem Manajemen Rapor Sekolah Dasar dengan Knex.js migration system.

## Fitur

- User Authentication (Admin, Guru, Orang Tua)
- Manajemen Siswa & Kelas
- Manajemen Mata Pelajaran (Mapel)
- Input & Tracking Nilai Siswa
- Pembuatan & Manajemen Rapor
- Role-based Access Control (RBAC)
- JWT Authentication
- Database Migration dengan Knex.js

## Instalasi

### 1. Clone/Download Repository
\`\`\`bash
cd sistem-manajemen-rapor
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Buat Database MySQL
\`\`\`bash
mysql -u root -p
CREATE DATABASE sistem_manajemen_rapor;
\`\`\`

### 4. Konfigurasi Environment
- Copy `.env.example` menjadi `.env`
- Update konfigurasi:
\`\`\`
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sistem_manajemen_rapor
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
\`\`\`

### 5. Run Database Migration
\`\`\`bash
npm run migrate:latest
\`\`\`

Perintah ini akan membuat semua table secara otomatis.

### 6. Jalankan Server
\`\`\`bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
\`\`\`

Server akan berjalan di `http://localhost:5000`

## Perintah Knex Migration

\`\`\`bash
# Jalankan semua migration yang belum dijalankan
npm run migrate:latest

# Rollback migration terakhir
npm run migrate:rollback

# Buat migration file baru
npm run migrate:make nama_migration
\`\`\`

Contoh membuat migration baru:
\`\`\`bash
npm run migrate:make add_kolom_baru_siswa
\`\`\`

File migration akan dibuat di folder `migrations/` dengan format timestamp.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### User Management
- `GET /api/users` - Get semua user (Admin only)
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user (Admin only)

### Siswa
- `GET /api/siswa` - Get semua siswa
- `GET /api/siswa/:id` - Get siswa by ID
- `GET /api/siswa/kelas/:id_kelas` - Get siswa by kelas
- `POST /api/siswa` - Create siswa baru (Admin, Guru)
- `PUT /api/siswa/:id` - Update siswa (Admin, Guru)
- `DELETE /api/siswa/:id` - Delete siswa (Admin only)

### Kelas
- `GET /api/kelas` - Get semua kelas
- `GET /api/kelas/:id` - Get kelas by ID
- `POST /api/kelas` - Create kelas baru (Admin only)
- `PUT /api/kelas/:id` - Update kelas (Admin only)
- `DELETE /api/kelas/:id` - Delete kelas (Admin only)

### Mapel
- `GET /api/mapel` - Get semua mapel
- `GET /api/mapel/:id` - Get mapel by ID
- `POST /api/mapel` - Create mapel baru (Admin only)
- `PUT /api/mapel/:id` - Update mapel (Admin only)
- `DELETE /api/mapel/:id` - Delete mapel (Admin only)

### Nilai
- `GET /api/nilai` - Get semua nilai
- `GET /api/nilai/siswa/:id_siswa` - Get nilai by siswa
- `GET /api/nilai/mapel/:id_mapel` - Get nilai by mapel
- `POST /api/nilai` - Create nilai baru (Admin, Guru)
- `PUT /api/nilai/:id` - Update nilai (Admin, Guru)
- `DELETE /api/nilai/:id` - Delete nilai (Admin, Guru)

### Rapor
- `GET /api/rapor` - Get semua rapor
- `GET /api/rapor/siswa/:id_siswa` - Get rapor by siswa
- `GET /api/rapor/detail/:id_rapor` - Get detail rapor dengan nilai
- `POST /api/rapor` - Create rapor baru (Admin, Guru)
- `PUT /api/rapor/:id` - Update rapor (Admin, Guru)
- `DELETE /api/rapor/:id` - Delete rapor (Admin only)

## Authentication

Gunakan JWT token di header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Roles

- **admin**: Full access ke semua resource
- **guru**: Access ke siswa, nilai, dan rapor
- **ortu**: Read-only access ke rapor & nilai anak mereka

## Database Schema (via Knex Migration)

Migration files tersimpan di folder `migrations/` dengan urutan eksekusi:

1. `20240101000001_create_user_table.js` - User accounts
2. `20240101000002_create_kelas_table.js` - Classes
3. `20240101000003_create_mapel_table.js` - Subjects
4. `20240101000004_create_siswa_table.js` - Students (FK: kelas, user)
5. `20240101000005_create_nilai_table.js` - Grades (FK: siswa, mapel)
6. `20240101000006_create_rapor_table.js` - Report cards (FK: siswa)

### Tabel

- **user** - User accounts dengan role (admin, guru, ortu)
- **siswa** - Student info dengan referensi ke user dan kelas
- **kelas** - Classes/classroom info
- **mapel** - Subjects dengan KKM (Kriteria Ketuntasan Minimal)
- **nilai** - Grades dengan komponen (tugas, ulangan, UTS, UAS, rata-rata)
- **rapor** - Report cards dengan referensi ke siswa

## Error Handling

Server mengembalikan error dengan format JSON yang konsisten:
\`\`\`json
{
  "message": "Deskripsi error"
}
\`\`\`

## Development

Gunakan `npm run dev` untuk menjalankan server dengan Nodemon (auto-reload).

## Production

1. Update `.env` dengan `NODE_ENV=production`
2. Run migration: `npm run migrate:latest`
3. Gunakan `npm start` untuk menjalankan server
4. Deploy ke server pilihan Anda (AWS, Digital Ocean, Heroku, dll)

## Troubleshooting

**Error: "Cannot find database"**
\`\`\`bash
# Pastikan database sudah dibuat
mysql -u root -p
CREATE DATABASE sistem_manajemen_rapor;
\`\`\`

**Error: "Migration failed"**
\`\`\`bash
# Check konfigurasi di .env
# Pastikan MySQL server running
# Run migration lagi
npm run migrate:latest
\`\`\`

**Error: "Table already exists"**
\`\`\`bash
# Rollback migration terakhir jika ada error
npm run migrate:rollback
\`\`\`

## License

ISC
