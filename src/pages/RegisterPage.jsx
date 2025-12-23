"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Logo from "../components/Logo"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("ortu")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await axios.post("/api/auth/register", { username, password, role })
      setSuccess("Registrasi berhasil! Silakan login.")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <Logo size={64} showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            <button 
              onClick={() => navigate("/")} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              SIRADA
            </button>
          </h1>
          <p className="text-center text-gray-600 mb-8">Daftar akun baru</p>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ortu">Orang Tua</option>
                <option value="guru">Guru</option>
                <option value="kepsek">Kepala Sekolah</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? "Loading..." : "Daftar"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Sudah punya akun?{" "}
            <button onClick={() => navigate("/login")} className="text-blue-600 font-semibold hover:underline">
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
