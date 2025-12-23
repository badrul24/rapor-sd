"use client"

import { useNavigate } from "react-router-dom"
import { BookOpen, Users, BarChart3, FileText, CheckCircle } from "lucide-react"
import Logo from "../components/Logo"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size={40} clickable={true} textColor="blue" onClick={() => navigate("/")} />
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow"
          >
            Masuk
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">SIRADA</h1>
              <p className="text-xl mb-4 text-blue-100">Sistem Rapor Digital Anak Sekolah Dasar</p>
              <p className="text-blue-100 mb-8">
                Platform manajemen nilai dan rapor digital yang dirancang khusus untuk sekolah dasar. Kelola data siswa,
                nilai per mata pelajaran, dan cetak rapor dengan mudah dan efisien.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-yellow-400 text-blue-600 font-semibold rounded-full hover:bg-yellow-300 transition shadow"
              >
                Mulai Sekarang
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-sm overflow-hidden">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">120+ Siswa</h3>
                <p className="text-sm text-blue-100">Terkelola dengan mudah</p>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-sm overflow-hidden">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">100 Rapor</h3>
                <p className="text-sm text-blue-100">Tercetak per semester</p>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-sm overflow-hidden">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">8 Mata Pelajaran</h3>
                <p className="text-sm text-blue-100">Dalam kurikulum</p>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-sm overflow-hidden">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">100% Aman</h3>
                <p className="text-sm text-blue-100">Data terenkripsi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Fitur Utama</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Manajemen Siswa</h3>
              <p className="text-gray-600">
                Kelola data siswa terstruktur dengan informasi lengkap termasuk NIS, nama, tanggal lahir, dan kelas.
              </p>
            </div>
            <div className="bg-yellow-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Input & Tracking Nilai</h3>
              <p className="text-gray-600">
                Catat nilai siswa untuk setiap mata pelajaran dengan perhitungan rata-rata otomatis.
              </p>
            </div>
            <div className="bg-green-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Cetak Rapor Digital</h3>
              <p className="text-gray-600">
                Generate dan cetak rapor semester dalam format yang profesional dan mudah dipahami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© 2025 SIRADA - Sistem Rapor Digital Anak Sekolah Dasar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
