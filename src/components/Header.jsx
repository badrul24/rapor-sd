import { UserCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Logo from "./Logo"

export default function Header({ title }) {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")
  const role = localStorage.getItem("role")

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "guru":
        return "Guru"
      case "ortu":
        return "Orang Tua"
      case "kepsek":
        return "Kepala Sekolah"
      default:
        return role || "User"
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <Logo 
        size={32} 
        textSize="text-lg" 
        textColor="blue"
        clickable={true}
        onClick={() => navigate("/dashboard")}
      />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">{username || "User"}</p>
          <p className="text-xs text-gray-500">{getRoleLabel(role)}</p>
        </div>
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )
}