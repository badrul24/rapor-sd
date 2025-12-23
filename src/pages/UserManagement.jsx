"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";

export default function UserManagement() {
  const { isCollapsed } = useSidebar();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // Ambil role user yang sedang login
  const currentUserRole = localStorage.getItem("role");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingUsername, setDeletingUsername] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    nip: "",
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.log("[v0] Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenModal = () => {
    setError("");
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      username: "",
      password: "",
      role: "",
      nip: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setError("");
    setIsEditMode(true);
    setEditingUserId(user.id_user);
    setFormData({
      username: user.username,
      password: "",
      role: user.role,
      nip: user.nip || "",
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

    if (!formData.username || !formData.role) {
      setError("Username dan role wajib diisi.");
      return;
    }

    if (!isEditMode && !formData.password) {
      setError("Password wajib diisi.");
      return;
    }

    const isDuplicate = users.some(
      (u) =>
        u.username.toLowerCase() === formData.username.toLowerCase() &&
        (!isEditMode || u.id_user !== editingUserId)
    );
    if (isDuplicate) {
      setError("Username sudah ada.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const payload = {
        username: formData.username,
        role: formData.role,
        nip:
          formData.role === "guru" || formData.role === "kepsek"
            ? formData.nip
            : null,
      };

      // Tambahkan password jika diisi (untuk mode Edit bersifat opsional)
      if (formData.password) {
        payload.password = formData.password;
      }

      let res;
      if (isEditMode) {
        res = await axios.put(
          `/api/users/${editingUserId}`,
          {
            username: formData.username,
            password: formData.password || undefined,
            role: formData.role,
            nip:
              formData.role === "guru" || formData.role === "kepsek"
                ? formData.nip
                : null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers((prev) =>
          prev.map((user) => (user.id_user === editingUserId ? res.data : user))
        );
        showSuccessModal("User berhasil diperbarui.");
      } else {
        res = await axios.post(
          "/api/users",
          {
            username: formData.username,
            password: formData.password,
            role: formData.role,
            nip: formData.role === "guru" || formData.role === "kepsek" ? formData.nip : null
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers((prev) => [...prev, res.data]);
        showSuccessModal("User berhasil ditambahkan.");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user) => {
    setError("");
    setDeletingUserId(user.id_user);
    setDeletingUsername(user.username);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;
    setIsDeleteModalOpen(false);
    setDeletingUserId(null);
    setDeletingUsername("");
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");
      const token = localStorage.getItem("token");
      await axios.delete(`/api/users/${deletingUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) =>
        prev.filter((user) => user.id_user !== deletingUserId)
      );
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
      setDeletingUsername("");
      showSuccessModal("User berhasil dihapus.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menghapus user.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header title="Manajemen User" />
        <main className="p-8">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Manajemen User
                </h2>
                <p className="text-gray-600 text-sm">
                  Kelola data pengguna sistem SIRADA
                </p>
              </div>
              {/* [HAK AKSES] Hanya Admin yang bisa menambah user */}
              {currentUserRole === "admin" && (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Tambah User
                </button>
              )}
            </div>

            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama pengguna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      NIP
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    {/* [HAK AKSES] Header Aksi disembunyikan untuk Kepsek */}
                    {currentUserRole === "admin" && (
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id_user}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-gray-700">{idx + 1}</td>
                      <td className="px-6 py-4 text-gray-800">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {user.nip || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                          {user.role === "kepsek"
                            ? "Kepala Sekolah"
                            : user.role}
                        </span>
                      </td>
                      {/* [HAK AKSES] Tombol aksi disembunyikan untuk Kepsek */}
                      {currentUserRole === "admin" && (
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Delete */}
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
                  Hapus User
                </h3>
                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-gray-700">
                    Apakah Anda yakin ingin menghapus user{" "}
                    <strong>{deletingUsername}</strong>?
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

          {/* Modal Tambah/Edit */}
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
                  {isEditMode ? "Edit User" : "Tambah User"}
                </h3>
                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Masukkan username"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password{" "}
                      {isEditMode && (
                        <span className="text-gray-500 text-xs">
                          (kosongkan jika tidak ingin mengubah)
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder={
                        isEditMode
                          ? "Kosongkan jika tidak ingin mengubah"
                          : "Masukkan password"
                      }
                      required={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      required
                    >
                      <option value="">Pilih Role</option>
                      <option value="admin">Admin</option>
                      <option value="guru">Guru</option>
                      <option value="kepsek">Kepala Sekolah</option>
                      <option value="ortu">Orang Tua</option>
                    </select>
                  </div>
                  {(formData.role === "guru" || formData.role === "kepsek") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIP / NIPPPK
                      </label>
                      <input
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        placeholder="Masukkan nomor induk"
                      />
                    </div>
                  )}
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
