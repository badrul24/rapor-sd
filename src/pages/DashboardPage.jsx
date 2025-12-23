"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { Users, BookOpen, BarChart3, FileText } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const navigate = useNavigate()
  // Mengambil role untuk pengecekan jika diperlukan di masa depan
  const role = localStorage.getItem("role") 
  const [stats, setStats] = useState({ siswa: 0, kelas: 0, mapel: 0, rapor: 0 })
  const [nilai, setNilai] = useState([])
  const [mapel, setMapel] = useState([])
  const [rapor, setRapor] = useState([])
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) navigate("/login")

    const usernameFromStorage = localStorage.getItem("username")
    setUsername(usernameFromStorage || "User")

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [siswaRes, kelasRes, mapelRes, raporRes, nilaiRes] = await Promise.all([
          axios.get("/api/siswa", { headers }).catch(() => ({ data: [] })),
          axios.get("/api/kelas", { headers }).catch(() => ({ data: [] })),
          axios.get("/api/mapel", { headers }).catch(() => ({ data: [] })),
          axios.get("/api/rapor", { headers }).catch(() => ({ data: [] })),
          axios.get("/api/nilai", { headers }).catch(() => ({ data: [] })),
        ])
        setStats({
          siswa: siswaRes.data.length,
          kelas: kelasRes.data.length,
          mapel: mapelRes.data.length,
          rapor: raporRes.data.length,
        })
        setMapel(mapelRes.data)
        setRapor(raporRes.data)
        setNilai(nilaiRes.data)
      } catch (error) {
        console.log("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  // Navigation handlers
  const navigateToSiswa = () => navigate("/siswa")
  const navigateToMapel = () => navigate("/mapel")
  const navigateToRapor = () => navigate("/rapor")
  const navigateToNilai = () => navigate("/nilai")

  // Hitung rata-rata nilai per mapel
  const getMapelAverage = (idMapel) => {
    const nilaiMapel = nilai.filter((n) => n.id_mapel === idMapel && n.rata_rata)
    if (nilaiMapel.length === 0) return 0
    const total = nilaiMapel.reduce((sum, n) => sum + parseFloat(n.rata_rata || 0), 0)
    return (total / nilaiMapel.length).toFixed(1)
  }

  // Hitung rata-rata keseluruhan
  const getOverallAverage = () => {
    const nilaiWithAverage = nilai.filter((n) => n.rata_rata)
    if (nilaiWithAverage.length === 0) return 0
    const total = nilaiWithAverage.reduce((sum, n) => sum + parseFloat(n.rata_rata || 0), 0)
    return (total / nilaiWithAverage.length).toFixed(1)
  }

  // Data untuk chart
  const chartData = mapel.slice(0, 8).map((m) => ({
    name: m.nama_mapel.length > 15 ? m.nama_mapel.substring(0, 15) + "..." : m.nama_mapel,
    nilai: parseFloat(getMapelAverage(m.id_mapel)),
    fullName: m.nama_mapel
  }))

  // Ambil rapor terbaru (2 teratas)
  const latestRapor = rapor.slice(0, 2)

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      {/* ml-64 agar konten tidak tertutup sidebar yang fixed */}
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Dashboard" />
        <main className="p-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang, {username}! 👋</h2>
            <p className="text-gray-600">Sistem Informasi Manajemen Rapor (SIRADA) - Monitoring data pendidikan.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div 
              className="bg-blue-50 rounded-xl p-6 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={navigateToSiswa}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Siswa</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.siswa}</p>
                  <p className="text-xs text-gray-500 mt-2">Siswa aktif</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={navigateToMapel}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Mata Pelajaran</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.mapel}</p>
                  <p className="text-xs text-gray-500 mt-2">Mapel tersedia</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-green-50 rounded-xl p-6 border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={navigateToRapor}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Rapor</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.rapor}</p>
                  <p className="text-xs text-gray-500 mt-2">Data rapor</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-purple-50 rounded-xl p-6 border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={navigateToNilai}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Rata-rata Nilai</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{getOverallAverage()}</p>
                  <p className="text-xs text-gray-500 mt-2">Semua mapel</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Rata-rata Nilai Per Mapel</h3>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [value, 'Rata-rata']}
                        labelFormatter={(label) => {
                          const item = chartData.find(d => d.name === label)
                          return item ? item.fullName : label
                        }}
                      />
                      <Bar dataKey="nilai" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Belum ada data grafik</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Rapor Terbaru</h3>
              <div className="space-y-3">
                {latestRapor.length > 0 ? (
                  latestRapor.map((r, index) => (
                    <div 
                      key={r.id_rapor} 
                      className={`p-4 ${index % 2 === 0 ? "bg-blue-50" : "bg-green-50"} rounded-xl border border-transparent cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={navigateToRapor}
                    >
                      <p className="font-semibold text-gray-800">
                        Rapor {r.nama_siswa || "Siswa"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Semester {r.semester} - {r.tahun_ajaran}
                      </p>
                      {r.tanggal_cetak && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Dibuat pada: {formatDate(r.tanggal_cetak)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic text-center py-10">Belum ada data rapor terbaru</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}