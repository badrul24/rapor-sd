"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search, Users, Filter, XCircle } from "lucide-react"; // Menambahkan Filter dan XCircle

export default function NilaiManagement() {
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState([]);
  // State baru untuk Kelas
  const [kelas, setKelas] = useState([]);
  const [nilaiSummary, setNilaiSummary] = useState({});
  const [search, setSearch] = useState("");
  // State filter Kelas
  const [filterKelas, setFilterKelas] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingNilai, setLoadingNilai] = useState(true);
  // Loading state Kelas
  const [loadingKelas, setLoadingKelas] = useState(true);

  // Fetch siswa
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/siswa", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSiswa(response.data);
      } catch (error) {
        console.log("[v0] Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSiswa();
  }, []);

  // Fetch Kelas (Sama seperti SiswaManagement)
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

  // Fetch semua nilai untuk summary
  useEffect(() => {
    const fetchNilaiSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/nilai", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Group nilai by siswa
        const summary = {};
        response.data.forEach((n) => {
          if (!summary[n.id_siswa]) {
            summary[n.id_siswa] = { count: 0, average: 0, scores: [] };
          }
          summary[n.id_siswa].count += 1;
          if (n.rata_rata != null) {
            summary[n.id_siswa].scores.push(n.rata_rata);
          }
        });

        // Calculate average per siswa
        Object.keys(summary).forEach((id) => {
          const scores = summary[id].scores;
          summary[id].average =
            scores.length > 0
              ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
              : 0;
        });

        setNilaiSummary(summary);
      } catch (error) {
        console.log("[v0] Error fetching nilai:", error);
      } finally {
        setLoadingNilai(false);
      }
    };
    fetchNilaiSummary();
  }, []);

  const handleSiswaClick = (siswaItem) => {
    navigate(`/nilai/${siswaItem.id_siswa}`);
  };

  const filteredSiswa = siswa.filter((s) => {
    // Filter berdasarkan search (nama siswa, NIS, kelas)
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      s.nama_siswa?.toLowerCase().includes(term) ||
      s.nis?.toLowerCase().includes(term) ||
      s.nama_kelas?.toLowerCase().includes(term);

    // Filter berdasarkan kelas
    const matchKelas =
      !filterKelas || Number(s.id_kelas) === Number(filterKelas);

    return matchSearch && matchKelas;
  });

  // Fungsi untuk reset semua filter
  const handleResetFilter = () => {
    setSearch("");
    setFilterKelas("");
  };

  // Cek apakah ada filter aktif
  const hasActiveFilter = search || filterKelas;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <Header title="Manajemen Nilai" />
        <main className="p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Manajemen Nilai
                </h2>
                <p className="text-gray-600 text-sm">
                  Kelola nilai siswa per mata pelajaran
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {siswa.length} Siswa Terdaftar
                </span>
              </div>
            </div>

            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama, NIS, atau kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
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
            {/* End Filter Section */}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      NIS
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Mapel Dinilai
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
                  ) : filteredSiswa.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Tidak ada data siswa
                      </td>
                    </tr>
                  ) : (
                    filteredSiswa.map((item, idx) => {
                      const summary = nilaiSummary[item.id_siswa] || {
                        count: 0,
                        average: 0,
                      };
                      return (
                        <tr
                          key={item.id_siswa}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSiswaClick(item)}
                        >
                          <td className="px-4 py-4 text-gray-700">{idx + 1}</td>
                          <td className="px-6 py-4 font-semibold text-blue-600 hover:text-blue-800">
                            {item.nama_siswa}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.nis}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.nama_kelas || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {loadingNilai
                              ? "Memuat..."
                              : `${summary.count} mapel`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
