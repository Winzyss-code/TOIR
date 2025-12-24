import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const menu = [
  { label: "Главное", path: "/", icon: LayoutDashboard },
  { label: "Оборудование", path: "/equipment", icon: Cpu },
  { label: "Заявки", path: "/work-orders", icon: Wrench },
  { label: "Отчёты", path: "/reports", icon: BarChart3 },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`bg-slate-900 text-slate-200 flex flex-col transition-all duration-300
      ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <span className="text-xl font-bold tracking-wide">
          {collapsed ? "Т" : "ТОиР"}
        </span>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
                ${collapsed ? "justify-center" : ""}
              `
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div
          className={`flex items-center gap-3 text-slate-400 text-sm
          ${collapsed ? "justify-center" : ""}`}
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span>Настройки</span>}
        </div>
      </div>
    </aside>
  )
}
