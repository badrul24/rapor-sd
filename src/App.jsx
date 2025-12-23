"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import UserManagement from "./pages/UserManagement"
import KelasManagement from "./pages/KelasManagement"
import SiswaManagement from "./pages/SiswaManagement"
import NilaiManagement from "./pages/NilaiManagement"
import SiswaNilaiDetail from "./pages/SiswaNilaiDetail"
import MapelManagement from "./pages/MapelManagement"
import RaporManagement from "./pages/RaporManagement"
import { SidebarProvider } from "./contexts/SidebarContext"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (token) {
      setIsAuthenticated(true)
      setUserRole(role)
    }
  }, [])

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    return children
  }

  return (
    <SidebarProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kelas"
          element={
            <ProtectedRoute>
              <KelasManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa"
          element={
            <ProtectedRoute>
              <SiswaManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nilai"
          element={
            <ProtectedRoute>
              <NilaiManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nilai/:id_siswa"
          element={
            <ProtectedRoute>
              <SiswaNilaiDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mapel"
          element={
            <ProtectedRoute>
              <MapelManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rapor"
          element={
            <ProtectedRoute>
              <RaporManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </SidebarProvider>
  )
}

export default App
