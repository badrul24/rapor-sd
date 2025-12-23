
// Import Libraries
const express = require("express")
const cors = require("cors")
require("dotenv").config()

// Import Route Files (Menggunakan CommonJS: require)
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const siswaRoutes = require("./routes/siswaRoutes")
const kelasRoutes = require("./routes/kelasRoutes")
const mapelRoutes = require("./routes/mapelRoutes")
const nilaiRoutes = require("./routes/nilaiRoutes")
const raporRoutes = require("./routes/raporRoutes")

// Import Middleware
const errorHandler = require("./middleware/errorHandler")

// Inisialisasi Aplikasi Express
const app = express()

// Middleware Dasar (Diletakkan di Awal)
app.use(cors()) // Mengizinkan permintaan lintas domain
app.use(express.json()) // Parser untuk body JSON dari request

// Rute Sambutan/Dasar (Opsional: Agar Port 5000 tidak langsung 404)
app.get("/", (req, res) => {
    res.json({ 
        message: "Selamat datang di API Sistem Manajemen Rapor (SIRADA)",
        status: "Running",
        environment: process.env.NODE_ENV || "development"
    });
});

// Pemasangan Rute (Mounting Routes)
// Semua permintaan ke /api/... akan diarahkan ke route handlers yang sesuai
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/siswa", siswaRoutes)
app.use("/api/kelas", kelasRoutes)
app.use("/api/mapel", mapelRoutes)
app.use("/api/nilai", nilaiRoutes)
app.use("/api/rapor", raporRoutes)

// Rute Health Check (untuk memastikan server dan API berjalan)
app.get("/api/health", (req, res) => {
 res.json({ message: "Server is running and operational" })
})

// Middleware Penanganan Rute Tidak Ditemukan (404 Handler)
// Harus diletakkan setelah SEMUA rute valid
app.use((req, res) => {
 res.status(404).json({ message: "Route tidak ditemukan", path: req.originalUrl })
})

// Middleware Penanganan Kesalahan Global (500 Internal Server Error)
// Harus diletakkan paling akhir
app.use(errorHandler)

// Konfigurasi Port
const PORT = process.env.PORT || 5000
// Konfigurasi Database (Knex)
const db = require("./config/database") // Membutuhkan knexfile.js

// Mulai Server setelah Koneksi Database Berhasil
// Ini memastikan API tidak menerima request jika database gagal
db.raw("SELECT 1")
 .then(() => {
  console.log("Database connected successfully")
  app.listen(PORT, () => {
   console.log(`Server berjalan di http://localhost:${PORT}`)
  })
 })
 .catch((err) => {
  console.error("Database connection failed:", err.message)
  // Menghentikan proses jika koneksi database gagal
  process.exit(1)
 })