import { useNavigate } from "react-router-dom"
import { auth } from "../app/auth"
import { User, Lock, LogIn } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    auth.login()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <form
        onSubmit={submit}
        className="bg-white w-96 rounded-xl shadow-lg p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 text-white">
            <LogIn />
          </div>
          <h1 className="text-2xl font-bold">CMMS</h1>
          <p className="text-sm text-gray-500">
            Вход в систему управления ТОиР
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Логин</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Введите логин"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="password"
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Введите пароль"
              required
            />
          </div>
        </div>

        
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition"
        >
          <LogIn size={16} />
          Войти
        </button>

        <p className="text-xs text-center text-gray-400">
          © 2025 CMMS Platform
        </p>
      </form>
    </div>
  )
}
