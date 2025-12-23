"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Eye, EyeOff } from "lucide-react"
import Logo from "../components/Logo"

export default function LoginPage({ setIsAuthenticated, setUserRole }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post("/api/auth/login", { username, password })
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("role", response.data.user.role)
      localStorage.setItem("username", response.data.user.username)
      setIsAuthenticated(true)
      setUserRole(response.data.user.role)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal")
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
          <p className="text-center text-gray-600 mb-8">Masuk ke Sistem Rapor Digital Anak Sekolah Dasar</p>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-full text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Masukkan username Anda"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Masukkan password Anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 rounded-full p-1 hover:bg-gray-100 transition"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4" />
                <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Lupa password?
              </a>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 mt-6 shadow"
            >
              {loading ? "Loading..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Belum punya akun?{" "}
            <button onClick={() => navigate("/register")} className="text-blue-600 font-semibold hover:underline">
              Daftar di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
