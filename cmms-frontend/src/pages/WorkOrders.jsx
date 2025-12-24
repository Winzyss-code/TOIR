import { useEffect, useState } from "react"
import {
  Search,
  Plus,
  SlidersHorizontal,
  MoreVertical,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react"
import Badge from "../components/Badge"
import CreateWorkOrderModal from "../components/CreateWorkOrderModal"
import { WorkOrdersService } from "../services/workOrders.service"

/* ===== CONFIGS ===== */

const statusConfig = {
  Open: { label: "Открыта", icon: AlertTriangle, color: "yellow" },
  "In Progress": { label: "В работе", icon: Clock, color: "blue" },
  Done: { label: "Завершена", icon: CheckCircle, color: "green" },
}

const typeConfig = {
  Emergency: { label: "Авария", icon: AlertTriangle, color: "text-red-600" },
  Planned: { label: "Плановое", icon: Wrench, color: "text-slate-600" },
}

const normalizePriority = (p) => {
  const s = String(p || "medium").toLowerCase()
  if (s === "high") return "High"
  if (s === "low") return "Low"
  return "Medium"
}

const priorityBadgeColor = {
  High: "red",
  Medium: "yellow",
  Low: "green",
}

const priorityConfig = {
  High: "red",
  Medium: "yellow",
  Low: "green",
}

/* ===== COMPONENT ===== */

export default function WorkOrders() {
  const [orders, setOrders] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  /* Load from localStorage */
  useEffect(() => {
    WorkOrdersService.getAll().then(setOrders)
  }, [])

  /* Normalize data (ANTI-CRASH) */
  const safeOrders = orders.map((o) => ({
  ...o,
  equipment: o.equipment || o.equipmentName || "—",
  location: o.location || "—",
  status:
    o.status === "open"
      ? "Open"
      : o.status === "in_progress"
      ? "In Progress"
      : o.status ?? "Open",
  type:
    o.type === "planned"
      ? "Planned"
      : o.type === "emergency"
      ? "Emergency"
      : o.type ?? "Planned",
}))


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Заявки
          </h1>
          <p className="text-sm text-gray-500">
            Управление запросами на обслуживание
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800"
        >
          <Plus size={16} />
          Создать заявку
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            placeholder="Поиск по оборудованию..."
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>

        <button className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm">
          <SlidersHorizontal size={16} />
          Фильтры
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3">Оборудование</th>
              <th className="px-4 py-3 text-center">Тип</th>
              <th className="px-4 py-3 text-center">Приоритет</th>
              <th className="px-4 py-3 text-center">Статус</th>
              <th className="px-4 py-3 text-center">Дата</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {safeOrders.map((row) => {
              const statusItem = statusConfig[row.status] || statusConfig.Open
              const typeItem = typeConfig[row.type] || typeConfig.Planned

              const StatusIcon = statusItem.icon
              const TypeIcon = typeItem.icon

              return (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.equipment}</div>
                    <div className="text-xs text-gray-500">
                      {row.location || "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div
                      className={`inline-flex items-center gap-1 text-xs ${typeItem.color}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      {typeItem.label}
                    </div>
                  </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                      {(() => {
                          const pr = normalizePriority(row.priority)
                          return (
                              <Badge color={priorityBadgeColor[pr]}>
                                {pr === "High" ? "high" : pr === "Medium" ? "medium" : "low"}
                              </Badge>
                              )
                      })()}
                  </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Badge color={statusItem.color}>
                        <span className="inline-flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusItem.label}
                        </span>
                      </Badge>
                    </div>
                  </td>


                  <td className="px-4 py-3 text-center text-gray-500">
                    {row.date}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <MoreVertical
                      size={16}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <CreateWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(order) => setOrders((prev) => [order, ...prev])}
      />
    </div>
  )
}
