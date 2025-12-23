"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { Search, Plus, Edit, Trash2, X, Filter, XCircle } from "lucide-react"

export default function SiswaManagement() {
  const [siswa, setSiswa] = useState([])
  const [kelas, setKelas] = useState([])
  const [search, setSearch] = useState("")
  const [filterKelas, setFilterKelas] = useState("")
  const [filterJenisKelamin, setFilterJenisKelamin] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingKelas, setLoadingKelas] = useState(true)
  const role = localStorage.getItem("role")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSiswaId, setEditingSiswaId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingSiswaId, setDeletingSiswaId] = useState(null)
  const [deletingSiswaNama, setDeletingSiswaNama] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nis: "",
    nama_siswa: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    id_kelas: "",
    hadir: 0,
    izin: 0,
    sakit: 0,
  })

  const [successModal, setSuccessModal] = useState({ open: false, message: "" })
  
  const showSuccessModal = (message) => {
    setSuccessModal({ open: true, message })
    setTimeout(() => {
      setSuccessModal({ open: false, message: "" })
    }, 2000)
  }


  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/siswa", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSiswa(response.data)
      } catch (error) {
        console.log("[v0] Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSiswa()
  }, [])

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/kelas", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setKelas(response.data)
      } catch (error) {
        console.log("[v0] Error fetching kelas:", error)
      } finally {
        setLoadingKelas(false)
      }
    }
    fetchKelas()
  }, [])

  const handleOpenModal = () => {
    setError("")
    setIsEditMode(false)
    setEditingSiswaId(null)
    setFormData({
      nis: "",
      nama_siswa: "",
      tanggal_lahir: "",
      jenis_kelamin: "",
      id_kelas: "",
      hadir: 0,
      izin: 0,
      sakit: 0,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (siswaItem) => {
    setError("")
    setIsEditMode(true)
    setEditingSiswaId(siswaItem.id_siswa)
    setFormData({
      nis: siswaItem.nis,
      nama_siswa: siswaItem.nama_siswa,
      tanggal_lahir: siswaItem.tanggal_lahir ? siswaItem.tanggal_lahir.split("T")[0] : "",
      jenis_kelamin: siswaItem.jenis_kelamin,
      id_kelas: siswaItem.id_kelas.toString(),
      hadir: siswaItem.hadir ?? 0,
      izin: siswaItem.izin ?? 0,
      sakit: siswaItem.sakit ?? 0,
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (saving) return
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'hadir' || name === 'izin' || name === 'sakit') {
      const numValue = Math.max(0, Math.min(100, parseInt(value || 0, 10)))
      
      // Hitung total saat ini
      const currentHadir = name === 'hadir' ? numValue : parseInt(formData.hadir || 0, 10)
      const currentIzin = name === 'izin' ? numValue : parseInt(formData.izin || 0, 10)
      const currentSakit = name === 'sakit' ? numValue : parseInt(formData.sakit || 0, 10)
      
      // Jika hadir = 100, set izin dan sakit ke 0
      if (name === 'hadir' && numValue === 100) {
        setFormData((prev) => ({ 
          ...prev, 
          hadir: numValue,
          izin: 0,
          sakit: 0
        }))
        return
      }
      
      // Jika hadir berubah dan sekarang < 100, pastikan izin + sakit tidak melebihi sisa
      if (name === 'hadir' && numValue < 100) {
        const sisa = 100 - numValue
        const totalIzinSakit = parseInt(formData.izin || 0, 10) + parseInt(formData.sakit || 0, 10)
        if (totalIzinSakit > sisa) {
          // Kurangi izin dan sakit secara proporsional
          const ratio = sisa / totalIzinSakit
          const newIzin = Math.floor(parseInt(formData.izin || 0, 10) * ratio)
          const newSakit = sisa - newIzin
          setFormData((prev) => ({ 
            ...prev, 
            hadir: numValue,
            izin: newIzin,
            sakit: newSakit
          }))
          return
        }
      }
      
      // Jika izin atau sakit berubah, batasi agar total tidak > 100
      if (name === 'izin' || name === 'sakit') {
        const sisa = 100 - currentHadir
        const adjustedValue = Math.min(numValue, sisa - (name === 'izin' ? currentSakit : currentIzin))
        setFormData((prev) => ({ ...prev, [name]: adjustedValue }))
        return
      }
      
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Debug logging
    console.log("Form data:", formData)

    // Validasi field wajib
    if (!formData.nis?.trim()) {
      setError("NIS wajib diisi.")
      return
    }
    if (!formData.nama_siswa?.trim()) {
      setError("Nama Siswa wajib diisi.")
      return
    }
    if (!formData.jenis_kelamin) {
      setError("Jenis Kelamin wajib diisi.")
      return
    }
    if (!formData.id_kelas || formData.id_kelas === "") {
      setError("Kelas wajib dipilih.")
      return
    }

    // Cek duplikasi NIS
    const isDuplicate = siswa.some(s => 
      s.nis === formData.nis && 
      (!isEditMode || s.id_siswa !== editingSiswaId)
    )
    if (isDuplicate) {
      setError("NIS sudah ada.")
      return
    }

    // Validasi kehadiran
    const hadir = parseInt(formData.hadir || 0, 10)
    const izin = parseInt(formData.izin || 0, 10)
    const sakit = parseInt(formData.sakit || 0, 10)
    const totalKehadiran = hadir + izin + sakit

    if (totalKehadiran > 100) {
      setError("Total kehadiran (hadir + izin + sakit) tidak boleh melebihi 100 hari.")
      return
    }

    if (hadir === 100 && (izin > 0 || sakit > 0)) {
      setError("Jika hadir 100 hari, maka izin dan sakit harus 0.")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      let res
      if (isEditMode) {
        // Update siswa
        res = await axios.put(
          `/api/siswa/${editingSiswaId}`,
          {
            nis: formData.nis,
            nama_siswa: formData.nama_siswa,
            tanggal_lahir: formData.tanggal_lahir || null,
            jenis_kelamin: formData.jenis_kelamin,
            id_kelas: parseInt(formData.id_kelas),
            hadir: parseInt(formData.hadir || 0, 10),
            izin: parseInt(formData.izin || 0, 10),
            sakit: parseInt(formData.sakit || 0, 10),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Update siswa di list
        setSiswa((prev) =>
          prev.map((s) => (s.id_siswa === editingSiswaId ? res.data : s))
        )
        showSuccessModal("Siswa berhasil diperbarui.")
      } else {
        // Tambah siswa baru
        res = await axios.post(
          "/api/siswa",
          {
            nis: formData.nis,
            nama_siswa: formData.nama_siswa,
            tanggal_lahir: formData.tanggal_lahir || null,
            jenis_kelamin: formData.jenis_kelamin,
            id_kelas: parseInt(formData.id_kelas),
            hadir: parseInt(formData.hadir || 0, 10),
            izin: parseInt(formData.izin || 0, 10),
            sakit: parseInt(formData.sakit || 0, 10),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Tambah siswa baru ke list
        setSiswa((prev) => [...prev, res.data])
        showSuccessModal("Siswa berhasil ditambahkan.")
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menyimpan siswa.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (siswaItem) => {
    setError("")
    setDeletingSiswaId(siswaItem.id_siswa)
    setDeletingSiswaNama(siswaItem.nama_siswa)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return
    setIsDeleteModalOpen(false)
    setDeletingSiswaId(null)
    setDeletingSiswaNama("")
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      setError("")
      const token = localStorage.getItem("token")
      await axios.delete(`/api/siswa/${deletingSiswaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Hapus siswa dari list
      setSiswa((prev) => prev.filter((s) => s.id_siswa !== deletingSiswaId))
      setIsDeleteModalOpen(false)
      setDeletingSiswaId(null)
      setDeletingSiswaNama("")
      showSuccessModal("Siswa berhasil dihapus.")
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menghapus siswa.")
    } finally {
      setDeleting(false)
    }
  }

  const filteredSiswa = siswa.filter((s) => {
    // Filter berdasarkan search (nama atau NIS)
    const matchSearch =
      !search ||
      s.nama_siswa?.toLowerCase().includes(search.toLowerCase()) ||
      s.nis?.toLowerCase().includes(search.toLowerCase())

    // Filter berdasarkan kelas
    const matchKelas = !filterKelas || Number(s.id_kelas) === Number(filterKelas)

    // Filter berdasarkan jenis kelamin
    const matchJenisKelamin = !filterJenisKelamin || s.jenis_kelamin === filterJenisKelamin

    return matchSearch && matchKelas && matchJenisKelamin
  })

  // Fungsi untuk reset semua filter
  const handleResetFilter = () => {
    setSearch("")
    setFilterKelas("")
    setFilterJenisKelamin("")
  }

  // Cek apakah ada filter aktif
  const hasActiveFilter = search || filterKelas || filterJenisKelamin

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Manajemen Siswa" />
        <main className="p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h2>
                <p className="text-gray-600 text-sm">Kelola data siswa dan informasi pribadinya</p>
              </div>
              {role !== "ortu" && (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Tambah Siswa
                </button>
              )}
            </div>

            {/* Search dan Filter */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau NIS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>

              {/* Filter Section */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>

                {/* Filter Kelas */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">Kelas:</label>
                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm min-w-[150px]"
                  >
                    <option value="">Semua Kelas</option>
                    {kelas.map((k) => (
                      <option key={k.id_kelas} value={k.id_kelas}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Jenis Kelamin */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">Jenis Kelamin:</label>
                  <select
                    value={filterJenisKelamin}
                    onChange={(e) => setFilterJenisKelamin(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm min-w-[150px]"
                  >
                    <option value="">Semua</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Reset Filter Button */}
                {hasActiveFilter && (
                  <button
                    onClick={handleResetFilter}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reset Filter
                  </button>
                )}

                {/* Info jumlah hasil */}
                <div className="ml-auto text-sm text-gray-500">
                  Menampilkan {filteredSiswa.length} dari {siswa.length} siswa
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th rowSpan="2" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      No
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Siswa
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      NIS
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tanggal Lahir
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Jenis Kelamin
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Kelas
                    </th>
                    <th colSpan="3" className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Kehadiran
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th rowSpan="2" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Hadir</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Izin</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Sakit</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredSiswa.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data siswa
                      </td>
                    </tr>
                  ) : (
                    filteredSiswa.map((item, idx) => (
                      <tr key={item.id_siswa} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{item.nama_siswa}</td>
                        <td className="px-6 py-4 text-gray-600">{item.nis}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(item.tanggal_lahir)}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.nama_kelas || "-"}</td>
                        <td className="px-4 py-4 text-center text-gray-800 font-semibold">{item.hadir ?? 0}</td>
                        <td className="px-4 py-4 text-center text-gray-800 font-semibold">{item.izin ?? 0}</td>
                        <td className="px-4 py-4 text-center text-gray-800 font-semibold">{item.sakit ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Konfirmasi Delete */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button
                  onClick={handleCloseDeleteModal}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  disabled={deleting}
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Hapus Siswa</h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-gray-700">
                    Apakah Anda yakin ingin menghapus siswa <strong>{deletingSiswaNama}</strong>?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={deleting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                    disabled={deleting}
                  >
                    {deleting ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Tambah/Edit Siswa */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {isEditMode ? "Edit Siswa" : "Tambah Siswa"}
                </h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nis"
                      value={formData.nis}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Masukkan NIS"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Siswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_siswa"
                      value={formData.nama_siswa}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Masukkan nama siswa"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      required
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_kelas"
                      value={formData.id_kelas}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {loadingKelas ? (
                        <option disabled>Memuat daftar kelas...</option>
                      ) : kelas.length === 0 ? (
                        <option disabled>Tidak ada kelas terdaftar</option>
                      ) : (
                        kelas.map((k) => (
                          <option key={k.id_kelas} value={k.id_kelas}>
                            {k.nama_kelas}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Kehadiran (total 100 hari)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Hadir</label>
                        <input
                          type="number"
                          name="hadir"
                          min="0"
                          max="100"
                          value={formData.hadir}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Izin</label>
                        <input
                          type="number"
                          name="izin"
                          min="0"
                          max={100 - parseInt(formData.hadir || 0, 10)}
                          value={formData.izin}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Sakit</label>
                        <input
                          type="number"
                          name="sakit"
                          min="0"
                          max={100 - parseInt(formData.hadir || 0, 10) - parseInt(formData.izin || 0, 10)}
                          value={formData.sakit}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {parseInt(formData.hadir || 0, 10) + parseInt(formData.izin || 0, 10) + parseInt(formData.sakit || 0, 10)} hari
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={saving}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                      disabled={saving}
                    >
                      {saving ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Modal Sukses */}
          {successModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-center flex flex-col items-center">
              <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Berhasil</h3>
              <p className="text-gray-700 mb-2">{successModal.message}</p>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}
