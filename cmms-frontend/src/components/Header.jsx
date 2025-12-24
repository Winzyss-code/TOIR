import { useAuth } from "../hooks/useAuth"
import { auth } from "../app/auth"
import { useNavigate } from "react-router-dom"

export default function Header() {
  const auth = useAuth()
  const navigate = useNavigate()

    const logout = () => {
    auth.logout()
    navigate("/login")
  }

  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
      <span className="font-semibold">Система ТОиР</span>

      <button
        onClick={logout}
        className="text-sm text-red-600"
      >
        Выйти
      </button>
    </header>
  )
}
