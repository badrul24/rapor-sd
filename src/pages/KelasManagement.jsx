"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { Search, Plus, Edit, Trash2, X } from "lucide-react"
import { useSidebar } from "../contexts/SidebarContext"

export default function KelasManagement() {
  const [kelas, setKelas] = useState([])
  const [guru, setGuru] = useState([])
  const [siswa, setSiswa] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingGuru, setLoadingGuru] = useState(true)
  const [loadingSiswa, setLoadingSiswa] = useState(true)
  const role = localStorage.getItem("role")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingKelasId, setEditingKelasId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingKelasId, setDeletingKelasId] = useState(null)
  const [deletingKelasNama, setDeletingKelasNama] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nama_kelas: "",
    wali_kelas: "", // Akan berisi id_user (Angka)
  })

  // State untuk modal sukses
  const [successModal, setSuccessModal] = useState({ open: false, message: "" })

  // Fungsi untuk menampilkan modal sukses
  const showSuccessModal = (message) => {
    setSuccessModal({ open: true, message })
    setTimeout(() => {
      setSuccessModal({ open: false, message: "" })
    }, 2000)
  }

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/kelas", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setKelas(response.data)
      } catch (error) {
        console.log("[v0] Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchKelas()
  }, [])

  const fetchSiswa = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/siswa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSiswa(response.data)
    } catch (error) {
      console.log("[v0] Error fetching siswa:", error)
    } finally {
      setLoadingSiswa(false)
    }
  }

  useEffect(() => {
    fetchSiswa()
  }, [])

  // Refresh data siswa ketika window mendapat focus
  useEffect(() => {
    const handleFocus = () => {
      fetchSiswa()
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const guruList = response.data.filter((user) => user.role === "guru")
        setGuru(guruList)
      } catch (error) {
        console.log("[v0] Error fetching guru:", error)
      } finally {
        setLoadingGuru(false)
      }
    }
    fetchGuru()
  }, [])

  const handleOpenModal = () => {
    setError("")
    setIsEditMode(false)
    setEditingKelasId(null)
    setFormData({
      nama_kelas: "",
      wali_kelas: "",
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (kelasItem) => {
    setError("")
    setIsEditMode(true)
    setEditingKelasId(kelasItem.id_kelas)
    setFormData({
      nama_kelas: kelasItem.nama_kelas,
      wali_kelas: kelasItem.wali_kelas || "", // Pastikan ini menangkap ID dari DB
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (saving) return
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.nama_kelas) {
      setError("Nama kelas wajib diisi.")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      let res
      // Konversi ke Integer karena database Opsi 1 menggunakan INT
      const dataToSave = {
        nama_kelas: formData.nama_kelas,
        wali_kelas: formData.wali_kelas ? parseInt(formData.wali_kelas) : null,
      }

      if (isEditMode) {
        res = await axios.put(
          `/api/kelas/${editingKelasId}`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Refresh data dari server agar nama_wali terupdate via join di backend
        const fetchResponse = await axios.get("/api/kelas", {
            headers: { Authorization: `Bearer ${token}` },
        })
        setKelas(fetchResponse.data)
        
        showSuccessModal("Kelas berhasil diperbarui.")
      } else {
        res = await axios.post(
          "/api/kelas",
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Refresh data
        const fetchResponse = await axios.get("/api/kelas", {
            headers: { Authorization: `Bearer ${token}` },
        })
        setKelas(fetchResponse.data)
        
        showSuccessModal("Kelas berhasil ditambahkan.")
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menyimpan kelas.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (kelasItem) => {
    setError("")
    setDeletingKelasId(kelasItem.id_kelas)
    setDeletingKelasNama(kelasItem.nama_kelas)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return
    setIsDeleteModalOpen(false)
    setDeletingKelasId(null)
    setDeletingKelasNama("")
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      setError("")
      const token = localStorage.getItem("token")
      await axios.delete(`/api/kelas/${deletingKelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setKelas((prev) => prev.filter((k) => k.id_kelas !== deletingKelasId))
      setIsDeleteModalOpen(false)
      setDeletingKelasId(null)
      setDeletingKelasNama("")
      showSuccessModal("Kelas berhasil dihapus.")
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menghapus kelas.")
    } finally {
      setDeleting(false)
    }
  }

  const filteredKelas = kelas.filter((k) => k.nama_kelas?.toLowerCase().includes(search.toLowerCase()))

  // Daftar ID guru yang sudah menjadi wali kelas (Logika menggunakan ID)
  const usedWaliKelasIds = kelas
    .filter((k) => k.wali_kelas)
    .map((k) => Number(k.wali_kelas))

  const isGuruSudahWaliKelas = (guruId) => {
    if (isEditMode && Number(formData.wali_kelas) === Number(guruId)) {
      return false
    }
    return usedWaliKelasIds.includes(Number(guruId))
  }

  const getJumlahSiswa = (idKelas) => {
    return siswa.filter((s) => Number(s.id_kelas) === Number(idKelas)).length
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Manajemen Kelas" />
        <main className="p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h2>
                <p className="text-gray-600 text-sm">Kelola data kelas dan wali kelas</p>
              </div>
              {role === "admin" && (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Tambah Kelas
                </button>
              )}
            </div>

            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama kelas atau wali kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Kelas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tingkat</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Wali Kelas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Jumlah Siswa</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredKelas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data kelas
                      </td>
                    </tr>
                  ) : (
                    filteredKelas.map((item, idx) => (
                      <tr key={item.id_kelas} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{item.nama_kelas}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.nama_kelas?.match(/\d+/)?.[0] ? `Kelas ${item.nama_kelas.match(/\d+/)[0]}` : "-"}
                        </td>
                        {/* MENAMPILKAN NAMA WALI (Hasil Join dari Backend) */}
                        <td className="px-6 py-4 text-gray-600">{item.nama_wali || "-"}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {loadingSiswa ? "..." : `${getJumlahSiswa(item.id_kelas)} siswa`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          {role === "admin" && (
                             <>
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
                             </>
                          )}
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Hapus Kelas</h3>
                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-gray-700">
                    Apakah Anda yakin ingin menghapus kelas <strong>{deletingKelasNama}</strong>?
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

          {/* Modal Tambah/Edit Kelas */}
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
                  {isEditMode ? "Edit Kelas" : "Tambah Kelas"}
                </h3>
                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_kelas"
                      value={formData.nama_kelas}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Contoh: 4A, 5B, 6C"
                      maxLength={20}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wali Kelas
                    </label>
                    <select
                      name="wali_kelas"
                      value={formData.wali_kelas}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    >
                      <option value="">Pilih Wali Kelas</option>
                      {guru.map((g) => (
                        <option
                          key={g.id_user}
                          value={g.id_user} // VALUE MENGGUNAKAN ID
                          disabled={isGuruSudahWaliKelas(g.id_user)}
                        >
                          {g.username}
                          {isGuruSudahWaliKelas(g.id_user) ? " (sudah wali kelas)" : ""}
                        </option>
                      ))}
                    </select>
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