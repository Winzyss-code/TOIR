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

export default function WorkOrders() {
  const [orders, setOrders] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  
  const user = JSON.parse(localStorage.getItem("cmms_user") || "{}")
  const isAdmin = user.role === "admin"
  const isTechnician = user.role === "technician"

  useEffect(() => {
    WorkOrdersService.getAll().then(setOrders)
  }, [])

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

  // Фильтрация
  const filteredOrders = safeOrders.filter(order => {
    // Поиск по оборудованию
    if (searchText && !order.equipment.toLowerCase().includes(searchText.toLowerCase())) {
      return false
    }
    // Фильтр по статусу
    if (filterStatus && order.status !== filterStatus) {
      return false
    }
    // Фильтр по типу
    if (filterType && order.type !== filterType) {
      return false
    }
    // Фильтр по приоритету
    if (filterPriority && normalizePriority(order.priority) !== filterPriority) {
      return false
    }
    // Мои заявки (для техников)
    if (showOnlyMine && order.assigned_to !== user.id) {
      return false
    }
    return true
  })

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
            {isAdmin ? "Управление запросами на обслуживание" : "Мои заявки"}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800"
          >
            <Plus size={16} />
            Создать заявку
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              placeholder="Поиск по оборудованию..."
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <button className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm hover:bg-gray-50">
            <SlidersHorizontal size={16} />
            Фильтры
          </button>

          {isTechnician && (
            <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
              />
              Мои заявки
            </label>
          )}
        </div>

        {/* Filter rows */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="Open">Открыта</option>
            <option value="In Progress">В работе</option>
            <option value="Done">Завершена</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Все типы</option>
            <option value="Emergency">Авария</option>
            <option value="Planned">Плановое</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">Все приоритеты</option>
            <option value="High">Высокий</option>
            <option value="Medium">Средний</option>
            <option value="Low">Низкий</option>
          </select>

          {(searchText || filterStatus || filterType || filterPriority || showOnlyMine) && (
            <button
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              onClick={() => {
                setSearchText("")
                setFilterStatus("")
                setFilterType("")
                setFilterPriority("")
                setShowOnlyMine(false)
              }}
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="text-sm text-gray-600 px-4 py-2 bg-gray-50">
          Найдено заявок: <strong>{filteredOrders.length}</strong>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Заявки не найдены
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Оборудование</th>
                <th className="px-4 py-3 text-center">Тип</th>
                <th className="px-4 py-3 text-center">Приоритет</th>
                <th className="px-4 py-3 text-center">Статус</th>
                <th className="px-4 py-3 text-center">Исполнитель</th>
                <th className="px-4 py-3 text-center">Дата</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((row) => {
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
                    {row.assigned_to ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {row.assigned_to === user.id ? "Я" : `ID: ${row.assigned_to}`}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
        )}
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
