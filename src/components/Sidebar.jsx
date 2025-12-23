"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, BookOpen, User, BarChart3, FileText, LogOut } from "lucide-react"
import { useState } from "react"
import Logo from "./Logo"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const role = localStorage.getItem("role")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("username")
    navigate("/login")
  }

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    // Menambahkan 'kepsek' ke menu-menu monitoring
    { path: "/user", label: "User", icon: Users, roles: ["admin", "kepsek"] },
    { path: "/kelas", label: "Kelas", icon: BookOpen, roles: ["admin", "guru", "kepsek"] },
    { path: "/siswa", label: "Siswa", icon: User, roles: ["admin", "guru", "kepsek"] },
    { path: "/nilai", label: "Nilai", icon: BarChart3, roles: ["admin", "guru", "kepsek"] },
    { path: "/mapel", label: "Mapel", icon: FileText, roles: ["admin", "guru", "kepsek"] },
    { path: "/rapor", label: "Rapor", icon: FileText, roles: ["admin", "guru", "ortu", "kepsek"] },
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(role)
  )

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 to-blue-700 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"} shadow-lg rounded-r-xl`}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-500">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
            <Logo 
              size={40} 
              showText={!collapsed} 
              textSize="text-lg"
              textColor="white"
              clickable={true}
              onClick={() => navigate("/")}
            />
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-blue-200 hover:text-white rounded-xl p-1 hover:bg-blue-500 transition"
              aria-label="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 flex-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-colors ${isActive ? "bg-yellow-400 text-blue-600 font-semibold" : "text-blue-100 hover:bg-blue-500"}`}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full mt-2 text-blue-200 hover:text-white rounded-xl py-2 hover:bg-blue-500 transition"
            aria-label="Expand sidebar"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}