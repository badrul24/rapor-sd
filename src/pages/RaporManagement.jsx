"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  X,
  Filter,
  XCircle,
} from "lucide-react";

export default function RaporManagement() {
  const [rapor, setRapor] = useState([]);
  const [siswa, setSiswa] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [kepsekList, setKepsekList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(true);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingKepsek, setLoadingKepsek] = useState(true);
  const role = localStorage.getItem("role");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRaporId, setEditingRaporId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRaporId, setDeletingRaporId] = useState(null);
  const [deletingInfo, setDeletingInfo] = useState({
    nama_siswa: "",
    semester: "",
    tahun_ajaran: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    id_siswa: "",
    semester: "",
    tahun_ajaran: "",
    catatan_guru: "",
    id_kepsek: "",
  });

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  const showSuccessModal = (message) => {
    setSuccessModal({ open: true, message });
    setTimeout(() => {
      setSuccessModal({ open: false, message: "" });
    }, 2000);
  };

  const fetchRapor = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rapor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRapor(response.data);
    } catch (error) {
      console.log("[v0] Error fetching rapor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapor();
  }, []);

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/siswa", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSiswa(response.data);
      } catch (error) {
        console.log("[v0] Error fetching siswa:", error);
      } finally {
        setLoadingSiswa(false);
      }
    };
    fetchSiswa();
  }, []);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/kelas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKelas(response.data);
      } catch (error) {
        console.log("[v0] Error fetching kelas:", error);
      } finally {
        setLoadingKelas(false);
      }
    };
    fetchKelas();
  }, []);

  useEffect(() => {
    const fetchKepsek = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter hanya user yang rolenya kepsek
        const filteredKepsek = response.data.filter((u) => u.role === "kepsek");
        setKepsekList(filteredKepsek);
      } catch (error) {
        console.log("Error fetching kepsek:", error);
      } finally {
        setLoadingKepsek(false);
      }
    };
    fetchKepsek();
  }, []);

  const handleOpenModal = () => {
    setError("");
    setIsEditMode(false);
    setEditingRaporId(null);
    setFormData({
      id_siswa: "",
      semester: "",
      tahun_ajaran: "",
      catatan_guru: "",
      id_kepsek: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (raporItem) => {
    setError("");
    setIsEditMode(true);
    setEditingRaporId(raporItem.id_rapor);
    setFormData({
      id_siswa: raporItem.id_siswa?.toString() || "",
      semester: raporItem.semester || "1",
      tahun_ajaran: raporItem.tahun_ajaran || "",
      catatan_guru: raporItem.catatan_guru || "",
      id_kepsek: raporItem.id_kepsek?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.id_siswa ||
      !formData.semester ||
      !formData.tahun_ajaran ||
      !formData.id_kepsek
    ) {
      setError(
        "Siswa, Semester, Tahun Ajaran, dan Kepala Sekolah wajib diisi."
      );
      return;
    }

    // Cek duplikasi rapor
    if (
      !isEditMode &&
      rapor.some(
        (r) =>
          r.id_siswa === parseInt(formData.id_siswa) &&
          r.semester === formData.semester &&
          r.tahun_ajaran === formData.tahun_ajaran
      )
    ) {
      setError(
        "Rapor untuk siswa ini pada semester dan tahun ajaran yang sama sudah ada."
      );
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (isEditMode) {
        await axios.put(
          `/api/rapor/${editingRaporId}`,
          {
            catatan_guru: formData.catatan_guru || null,
            id_kepsek: parseInt(formData.id_kepsek),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccessModal("Rapor berhasil diperbarui.");
      } else {
        await axios.post(
          "/api/rapor",
          {
            id_siswa: parseInt(formData.id_siswa),
            semester: formData.semester,
            tahun_ajaran: formData.tahun_ajaran,
            catatan_guru: formData.catatan_guru || null,
            id_kepsek: parseInt(formData.id_kepsek),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccessModal("Rapor berhasil ditambahkan.");
      }

      // Refresh data rapor
      fetchRapor();

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan rapor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (raporItem) => {
    setError("");
    setDeletingRaporId(raporItem.id_rapor);
    setDeletingInfo({
      nama_siswa: raporItem.nama_siswa || "",
      semester: raporItem.semester || "",
      tahun_ajaran: raporItem.tahun_ajaran || "",
    });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;
    setIsDeleteModalOpen(false);
    setDeletingRaporId(null);
    setDeletingInfo({ nama_siswa: "", semester: "", tahun_ajaran: "" });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");
      const token = localStorage.getItem("token");
      await axios.delete(`/api/rapor/${deletingRaporId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Hapus rapor dari list
      setRapor((prev) => prev.filter((r) => r.id_rapor !== deletingRaporId));
      setIsDeleteModalOpen(false);
      setDeletingRaporId(null);
      setDeletingInfo({ nama_siswa: "", semester: "", tahun_ajaran: "" });
      showSuccessModal("Rapor berhasil dihapus.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menghapus rapor.");
    } finally {
      setDeleting(false);
    }
  };

  // FUNGSI INI SUDAH DIPERBAIKI UNTUK REFRESH DATA SETELAH DOWNLOAD
  const handleDownloadPDF = async (idRapor) => {
    try {
      console.log("Starting PDF download for rapor ID:", idRapor);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/rapor/pdf/${idRapor}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      console.log("PDF response received:", {
        status: response.status,
        contentType:
          response.headers["content-type"] || response.headers["Content-Type"],
        blobSize: response.data.size,
      });

      const contentType =
        response.headers["content-type"] || response.headers["Content-Type"];

      if (contentType && contentType.includes("application/pdf")) {
        console.log("Valid PDF response, creating download link...");

        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition =
          response.headers["content-disposition"] ||
          response.headers["Content-Disposition"];
        let filename = `Rapor_${idRapor}.pdf`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
            try {
              filename = decodeURIComponent(filename);
            } catch (e) {
              // Fallback to original filename
            }
          }
        }

        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        console.log("PDF download initiated:", filename);

        // --- START PERBAIKAN TANGGAL CETAK ---
        // Refresh data setelah download berhasil untuk menampilkan tanggal cetak terbaru
        fetchRapor();
        showSuccessModal(
          "Rapor berhasil diunduh dan tanggal cetak diperbarui."
        );
        // --- END PERBAIKAN TANGGAL CETAK ---
      } else {
        console.warn("Response is not PDF:", contentType);
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            alert(`Error: ${errorData.message || "Gagal mengunduh PDF rapor"}`);
          } catch (e) {
            alert("Gagal mengunduh PDF rapor. Format response tidak valid.");
          }
        };
        reader.readAsText(response.data);
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      // Penanganan error jika response adalah blob
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            alert(`Error: ${errorData.message || "Gagal mengunduh PDF rapor"}`);
          } catch (e) {
            alert("Gagal mengunduh PDF rapor.");
          }
        };
        reader.readAsText(err.response.data);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(
          "Gagal mengunduh PDF rapor. Periksa koneksi atau hubungi administrator."
        );
      }
    }
  };

  const filteredRapor = rapor.filter((r) => {
    // Filter berdasarkan search (nama siswa, kelas, semester, tahun ajaran)
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      r.nama_siswa?.toLowerCase().includes(term) ||
      r.nama_kelas?.toLowerCase().includes(term) ||
      r.semester?.includes(term) ||
      r.tahun_ajaran?.toLowerCase().includes(term);

    // Filter berdasarkan kelas
    const matchKelas =
      !filterKelas || Number(r.id_kelas) === Number(filterKelas);

    // Filter berdasarkan semester
    const matchSemester = !filterSemester || r.semester === filterSemester;

    // Filter berdasarkan tahun ajaran
    const matchTahunAjaran =
      !filterTahunAjaran || r.tahun_ajaran === filterTahunAjaran;

    return matchSearch && matchKelas && matchSemester && matchTahunAjaran;
  });

  // Fungsi untuk reset semua filter
  const handleResetFilter = () => {
    setSearch("");
    setFilterKelas("");
    setFilterSemester("");
    setFilterTahunAjaran("");
  };

  // Cek apakah ada filter aktif
  const hasActiveFilter =
    search || filterKelas || filterSemester || filterTahunAjaran;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // Tampilkan tanggal lokal, jika ada jam, abaikan (hanya tanggal)
    try {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString.split("T")[0] || "-";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Manajemen Rapor" />
        <main className="p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Manajemen Rapor
                </h2>
                <p className="text-gray-600 text-sm">
                  Kelola rapor siswa dan cetak laporan
                </p>
              </div>
              {role !== "ortu" && (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Buat Rapor
                </button>
              )}
            </div>

            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, semester, atau tahun ajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter:
                  </span>
                </div>

                {/* Filter Kelas */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
                    Kelas:
                  </label>
                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm min-w-[150px]"
                  >
                    <option value="">Semua Kelas</option>
                    {loadingKelas ? (
                      <option disabled>Memuat kelas...</option>
                    ) : kelas.length === 0 ? (
                      <option disabled>Tidak ada kelas</option>
                    ) : (
                      kelas.map((k) => (
                        <option key={k.id_kelas} value={k.id_kelas}>
                          {k.nama_kelas}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Filter Semester */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
                    Semester:
                  </label>
                  <select
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm min-w-[150px]"
                  >
                    <option value="">Semua Semester</option>
                    <option value="1">Semester I (Ganjil)</option>
                    <option value="2">Semester II (Genap)</option>
                  </select>
                </div>

                {/* Filter Tahun Ajaran */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
                    Tahun Ajaran:
                  </label>
                  <select
                    value={filterTahunAjaran}
                    onChange={(e) => setFilterTahunAjaran(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm min-w-[150px]"
                  >
                    <option value="">Semua Tahun</option>
                    {Array.from(
                      new Set(rapor.map((r) => r.tahun_ajaran).filter(Boolean))
                    )
                      .sort()
                      .map((tahun) => (
                        <option key={tahun} value={tahun}>
                          {tahun}
                        </option>
                      ))}
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
                  Menampilkan {filteredRapor.length} dari {rapor.length} rapor
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tahun Ajaran
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tanggal Cetak
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredRapor.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Tidak ada data rapor
                      </td>
                    </tr>
                  ) : (
                    filteredRapor.map((item) => (
                      <tr
                        key={item.id_rapor}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {item.nama_siswa || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.nama_kelas || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.semester === "1" ? "I (Ganjil)" : "II (Genap)"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.tahun_ajaran || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(item.tanggal_cetak)}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleDownloadPDF(item.id_rapor)}
                            className="text-green-600 hover:text-green-800"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Hapus Rapor
                </h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-gray-700">
                    Apakah Anda yakin ingin menghapus rapor untuk{" "}
                    <strong>{deletingInfo.nama_siswa || "siswa ini"}</strong> -
                    Semester <strong>{deletingInfo.semester || "-"}</strong> -
                    Tahun Ajaran{" "}
                    <strong>{deletingInfo.tahun_ajaran || "-"}</strong>?
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

          {/* Modal Tambah/Edit Rapor */}
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
                  {isEditMode ? "Edit Rapor" : "Buat Rapor"}
                </h3>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Siswa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Siswa <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_siswa"
                      value={formData.id_siswa}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      disabled={isEditMode}
                      required={!isEditMode}
                    >
                      <option value="">Pilih Siswa</option>
                      {loadingSiswa ? (
                        <option disabled>Memuat daftar siswa...</option>
                      ) : siswa.length === 0 ? (
                        <option disabled>Tidak ada siswa terdaftar</option>
                      ) : (
                        siswa.map((s) => (
                          <option key={s.id_siswa} value={s.id_siswa}>
                            {s.nama_siswa} ({s.nis})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      disabled={isEditMode}
                      required={!isEditMode}
                    >
                      <option value="">Pilih Semester</option>
                      {/* Logika filter semester berdasarkan bulan (0 = Januari, 11 = Desember) */}
                      {(new Date().getMonth() >= 0 &&
                        new Date().getMonth() <= 5) ||
                      isEditMode ? (
                        <option value="1">Semester I (Ganjil)</option>
                      ) : null}
                      {(new Date().getMonth() >= 6 &&
                        new Date().getMonth() <= 11) ||
                      isEditMode ? (
                        <option value="2">Semester II (Genap)</option>
                      ) : null}
                    </select>
                  </div>

                  {/* Tahun Ajaran */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Ajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tahun_ajaran"
                      value={formData.tahun_ajaran}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Contoh: 2024/2025"
                      disabled={isEditMode}
                      required={!isEditMode}
                    />
                  </div>

                  {/* Input Pilih Kepala Sekolah - Tambahkan setelah input Tahun Ajaran */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kepala Sekolah <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_kepsek"
                      value={formData.id_kepsek}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      required
                    >
                      <option value="">Pilih Kepala Sekolah</option>
                      {loadingKepsek ? (
                        <option disabled>Memuat daftar kepsek...</option>
                      ) : kepsekList.length === 0 ? (
                        <option disabled>
                          Tidak ada Kepala Sekolah terdaftar
                        </option>
                      ) : (
                        kepsekList.map((k) => (
                          <option key={k.id_user} value={k.id_user}>
                            {k.username}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Catatan Wali Kelas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Wali Kelas
                    </label>
                    <textarea
                      name="catatan_guru"
                      value={formData.catatan_guru}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Masukkan catatan wali kelas..."
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
                      {saving
                        ? "Menyimpan..."
                        : isEditMode
                        ? "Update"
                        : "Simpan"}
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
                <svg
                  className="w-12 h-12 text-green-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Berhasil
                </h3>
                <p className="text-gray-700 mb-2">{successModal.message}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
