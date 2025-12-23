"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { Search, Plus, Edit, Trash2, X } from "lucide-react"

export default function MapelManagement() {
  const [mapel, setMapel] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const role = localStorage.getItem("role")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMapelId, setEditingMapelId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMapelId, setDeletingMapelId] = useState(null)
  const [deletingMapelNama, setDeletingMapelNama] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nama_mapel: "",
    kkm: "",
  })

  const [successModal, setSuccessModal] = useState({ open: false, message: "" })

  const showSuccessModal = (message) => {
    setSuccessModal({ open: true, message })
    setTimeout(() => {
      setSuccessModal({ open: false, message: "" })
    }, 2000)
  }

  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/mapel", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMapel(response.data)
      } catch (error) {
        console.log("[v0] Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMapel()
  }, [])

  const handleOpenModal = () => {
    setError("")
    setIsEditMode(false)
    setEditingMapelId(null)
    setFormData({
      nama_mapel: "",
      kkm: "",
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (mapelItem) => {
    setError("")
    setIsEditMode(true)
    setEditingMapelId(mapelItem.id_mapel)
    setFormData({
      nama_mapel: mapelItem.nama_mapel,
      kkm: mapelItem.kkm ?? 70,
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (saving) return
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "kkm" ? (value === "" ? "" : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.nama_mapel) {
      setError("Nama mapel wajib diisi.")
      return
    }

    // Cek duplikasi nama mapel
    const isDuplicate = mapel.some(m => 
      m.nama_mapel.toLowerCase() === formData.nama_mapel.toLowerCase() && 
      (!isEditMode || m.id_mapel !== editingMapelId)
    )
    if (isDuplicate) {
      setError("Nama mata pelajaran sudah ada.")
      return
    }

    const payload = {
      nama_mapel: formData.nama_mapel,
      kkm: formData.kkm === "" || formData.kkm == null ? 70 : Number(formData.kkm),
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      let res
      if (isEditMode) {
        // Update mapel
        res = await axios.put(
          `/api/mapel/${editingMapelId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Update mapel di list
        setMapel((prev) =>
          prev.map((m) => (m.id_mapel === editingMapelId ? res.data : m))
        )
        showSuccessModal("Mata pelajaran berhasil diperbarui.")
      } else {
        // Tambah mapel baru
        res = await axios.post(
          "/api/mapel",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Tambah mapel baru ke list
        setMapel((prev) => [...prev, { ...payload, id_mapel: res.data.id_mapel }])
        showSuccessModal("Mata pelajaran berhasil ditambahkan.")
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menyimpan mapel.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (mapelItem) => {
    setError("")
    setDeletingMapelId(mapelItem.id_mapel)
    setDeletingMapelNama(mapelItem.nama_mapel)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return
    setIsDeleteModalOpen(false)
    setDeletingMapelId(null)
    setDeletingMapelNama("")
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      setError("")
      const token = localStorage.getItem("token")
      await axios.delete(`/api/mapel/${deletingMapelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Hapus mapel dari list
      setMapel((prev) => prev.filter((m) => m.id_mapel !== deletingMapelId))
      setIsDeleteModalOpen(false)
      setDeletingMapelId(null)
      setDeletingMapelNama("")
      showSuccessModal("Mata pelajaran berhasil dihapus.")
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menghapus mapel.")
    } finally {
      setDeleting(false)
    }
  }

  const filteredMapel = mapel.filter((m) =>
    m.nama_mapel?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Manajemen Mata Pelajaran" />
        <main className="p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Mata Pelajaran</h2>
                <p className="text-gray-600 text-sm">Kelola daftar mata pelajaran dan KKM</p>
              </div>
              {role !== "ortu" && (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Tambah Mapel
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama mata pelajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Mata Pelajaran</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">KKM</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredMapel.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data mata pelajaran
                      </td>
                    </tr>
                  ) : (
                    filteredMapel.map((item, idx) => (
                      <tr key={item.id_mapel} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{item.nama_mapel}</td>
                        <td className="px-6 py-4 text-gray-600">{item.kkm ?? 70}</td>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Hapus Mata Pelajaran</h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-gray-700">
                    Apakah Anda yakin ingin menghapus mata pelajaran <strong>{deletingMapelNama}</strong>?
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

          {/* Modal Tambah/Edit Mapel */}
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
                  {isEditMode ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                </h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_mapel"
                      value={formData.nama_mapel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Contoh: Matematika, Bahasa Indonesia"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KKM
                    </label>
                    <input
                      type="number"
                      name="kkm"
                      value={formData.kkm}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      min={0}
                      max={100}
                    />
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
