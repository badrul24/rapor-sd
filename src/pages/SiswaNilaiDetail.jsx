"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { ArrowLeft, Plus, Edit, Trash2, X } from "lucide-react"

export default function SiswaNilaiDetail() {
  const { id_siswa } = useParams()
  const navigate = useNavigate()
  const [siswa, setSiswa] = useState(null)
  const [nilai, setNilai] = useState([])
  const [mapel, setMapel] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMapel, setLoadingMapel] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMapel, setSelectedMapel] = useState(null)
  const [existingNilai, setExistingNilai] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    tugas: "",
    ulangan: "",
    uts: "",
    uas: "",
    capaian_kompetensi: "",
  })

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingNilaiId, setDeletingNilaiId] = useState(null)
  const [deletingMapelNama, setDeletingMapelNama] = useState("")
  const [deleting, setDeleting] = useState(false)

  // State dan Fungsi Modal Sukses (Disesuaikan dengan MapelManagement.jsx)
  const [successModal, setSuccessModal] = useState({ open: false, message: "" })

  const showSuccessModal = (message) => {
    setSuccessModal({ open: true, message })
    setTimeout(() => {
      setSuccessModal({ open: false, message: "" })
    }, 2000)
  }

  // Fungsi untuk refresh nilai (menggantikan logika refresh di handleSubmit)
  const fetchNilai = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/nilai", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const nilaiSiswa = response.data.filter(n => n.id_siswa === parseInt(id_siswa))
      setNilai(nilaiSiswa)
    } catch (error) {
      console.log("[v0] Error fetching nilai:", error)
    } finally {
      setLoading(false)
    }
  }, [id_siswa])

  // Fetch data siswa
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/siswa", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const siswaData = response.data.find(s => s.id_siswa === parseInt(id_siswa))
        if (siswaData) {
          setSiswa(siswaData)
        } else {
          navigate("/nilai") // Redirect jika siswa tidak ditemukan
        }
      } catch (error) {
        console.log("[v0] Error fetching siswa:", error)
        navigate("/nilai") // Redirect jika error
      }
    }
    fetchSiswa()
  }, [id_siswa, navigate])

  // Fetch nilai siswa
  useEffect(() => {
    fetchNilai()
  }, [fetchNilai])

  // Fetch mapel
  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/mapel", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMapel(response.data)
      } catch (error) {
        console.log("[v0] Error fetching mapel:", error)
      } finally {
        setLoadingMapel(false)
      }
    }
    fetchMapel()
  }, [])

  const handleOpenModal = (mapelItem) => {
    setError("")
    const existing = nilai.find(n => n.id_mapel === mapelItem.id_mapel)
    setSelectedMapel(mapelItem)
    setExistingNilai(existing)
    setFormData({
      tugas: existing?.tugas != null ? existing.tugas.toString() : "",
      ulangan: existing?.ulangan != null ? existing.ulangan.toString() : "",
      uts: existing?.uts != null ? existing.uts.toString() : "",
      uas: existing?.uas != null ? existing.uas.toString() : "",
      capaian_kompetensi: existing?.capaian_kompetensi || "",
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (saving) return
    setIsModalOpen(false)
    setSelectedMapel(null)
    setExistingNilai(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const parseScore = (value) => {
    if (value === "" || value === null || value === undefined) return null
    const num = Number(value)
    return Number.isNaN(num) ? null : num
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validasi nilai minimal harus diisi salah satu (ditambahkan dari versi perbaikan sebelumnya)
    const hasScore = formData.tugas || formData.ulangan || formData.uts || formData.uas;
    if (!hasScore) {
      setError("Minimal satu jenis nilai (Tugas, Ulangan, UTS, atau UAS) harus diisi.")
      return
    }

    const payload = {
      id_siswa: parseInt(id_siswa),
      id_mapel: selectedMapel.id_mapel,
      tugas: parseScore(formData.tugas),
      ulangan: parseScore(formData.ulangan),
      uts: parseScore(formData.uts),
      uas: parseScore(formData.uas),
      capaian_kompetensi: formData.capaian_kompetensi || null,
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      let successMessage = ""

      if (existingNilai) {
        // Update nilai
        await axios.put(`/api/nilai/${existingNilai.id_nilai}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        successMessage = `Nilai ${selectedMapel.nama_mapel} berhasil diperbarui.`
      } else {
        // Create nilai baru
        await axios.post("/api/nilai", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        successMessage = `Nilai ${selectedMapel.nama_mapel} berhasil ditambahkan.`
      }

      // Refresh data nilai
      await fetchNilai()

      setIsModalOpen(false)
      showSuccessModal(successMessage)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menyimpan nilai.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (nilaiItem) => {
    setError("")
    setDeletingNilaiId(nilaiItem.id_nilai)
    setDeletingMapelNama(nilaiItem.nama_mapel)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return
    setIsDeleteModalOpen(false)
    setDeletingNilaiId(null)
    setDeletingMapelNama("")
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      setError("")
      const token = localStorage.getItem("token")
      await axios.delete(`/api/nilai/${deletingNilaiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Hapus nilai dari list dan tampilkan pesan sukses
      setNilai((prev) => prev.filter((n) => n.id_nilai !== deletingNilaiId))
      showSuccessModal(`Nilai ${deletingMapelNama} berhasil dihapus.`)

      setIsDeleteModalOpen(false)
      setDeletingNilaiId(null)
      setDeletingMapelNama("")
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Gagal menghapus nilai.")
    } finally {
      setDeleting(false)
    }
  }

  if (loading || loadingMapel || !siswa) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-64 overflow-auto">
          <Header title="Detail Nilai Siswa" />
          <main className="p-8">
            <div className="text-center text-gray-500">Memuat data...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Detail Nilai Siswa" />
        <main className="p-8">
          {/* Header dengan info siswa */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/nilai")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{siswa.nama_siswa}</h2>
                  <p className="text-gray-600">NIS: {siswa.nis} | Kelas: {siswa.nama_kelas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Mapel dengan Input Nilai */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nilai Mata Pelajaran</h3>

            <div className="grid gap-4">
              {mapel.map((m, index) => {
                const nilaiMapel = nilai.find(n => n.id_mapel === m.id_mapel)
                return (
                  <div key={m.id_mapel} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm font-medium text-gray-500 w-8">{index + 1}.</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{m.nama_mapel}</h4>
                          {nilaiMapel && (
                            <div className="flex items-center gap-8 mt-2">
                              <div className="text-sm text-gray-600">
                                Rata-rata: <span className="font-semibold text-blue-600">{nilaiMapel.rata_rata || "-"}</span>
                              </div>
                              <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Tugas:</span>
                                  <span className="font-medium">{nilaiMapel.tugas ?? "-"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">UTS:</span>
                                  <span className="font-medium">{nilaiMapel.uts ?? "-"}</span>
                                </div>
                              </div>
                              <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Ulangan:</span>
                                  <span className="font-medium">{nilaiMapel.ulangan ?? "-"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">UAS:</span>
                                  <span className="font-medium">{nilaiMapel.uas ?? "-"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {nilaiMapel ? (
                          <>
                            <button
                              onClick={() => handleOpenModal(m)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit Nilai"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick({ ...nilaiMapel, nama_mapel: m.nama_mapel })}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(m)}
                            className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1 rounded-xl hover:bg-blue-700 transition-colors"
                            title="Input Nilai"
                          >
                            <Plus className="w-4 h-4" /> Input
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Modal Input/Edit Nilai (Style Disesuaikan) */}
          {isModalOpen && selectedMapel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {existingNilai ? "Edit" : "Input"} Nilai - {selectedMapel.nama_mapel}
                </h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tugas
                      </label>
                      <input
                        type="number"
                        name="tugas"
                        value={formData.tugas}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ulangan
                      </label>
                      <input
                        type="number"
                        name="ulangan"
                        value={formData.ulangan}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UTS
                      </label>
                      <input
                        type="number"
                        name="uts"
                        value={formData.uts}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UAS
                      </label>
                      <input
                        type="number"
                        name="uas"
                        value={formData.uas}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capaian Kompetensi
                    </label>
                    <textarea
                      name="capaian_kompetensi"
                      value={formData.capaian_kompetensi}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      rows={3}
                      placeholder="Contoh: Ananda menunjukkan penguasaan dalam ..."
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
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Delete (Style Disesuaikan) */}
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Hapus Nilai</h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-gray-700">
                    Apakah Anda yakin ingin menghapus nilai{" "}
                    <strong>{deletingMapelNama}</strong> untuk siswa{" "}
                    <strong>{siswa.nama_siswa}</strong>?
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
          
          {/* Modal Sukses (Style Disesuaikan) */}
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