import { useEffect, useMemo, useState } from "react"
import { WorkOrdersService } from "../services/workOrders.service"
import { calcKpi, emergencyByEquipment } from "../utils/dashboardStats"
import KpiCard from "../components/KpiCard"
import StatusChart from "../components/StatusChart"
import EmergencyTable from "../components/EmergencyTable"
import {
  ClipboardList,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Flame,
  BarChart3,
} from "lucide-react"

function normalizeStatus(status) {
  if (!status) return "Open"

  const s = String(status).toLowerCase()
  if (s === "open") return "Open"
  if (s === "in_progress" || s === "in progress" || s === "inprogress") return "In Progress"
  if (s === "done" || s === "completed" || s === "complete") return "Done"

  // если вдруг уже красиво пришло:
  if (status === "Open" || status === "In Progress" || status === "Done") return status

  return "Open"
}

function normalizeType(type) {
  if (!type) return "Planned"

  const t = String(type).toLowerCase()
  if (t === "emergency" || t === "breakdown") return "Emergency"
  if (t === "planned" || t === "plan") return "Planned"

  if (type === "Emergency" || type === "Planned") return type

  return "Planned"
}

function normalizePriority(priority) {
  if (!priority) return "Medium"

  const p = String(priority).toLowerCase()
  if (p === "high") return "High"
  if (p === "low") return "Low"
  if (p === "medium") return "Medium"

  // если вдруг пришло "HIGH" / "LOW" / "MEDIUM"
  const up = String(priority).toUpperCase()
  if (up === "HIGH") return "High"
  if (up === "LOW") return "Low"
  if (up === "MEDIUM") return "Medium"

  return "Medium"
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    WorkOrdersService.getAll().then(setOrders)
  }, [])

  // ✅ нормализация (чтобы KPI и charts не ломались из-за localStorage)
  const safeOrders = useMemo(() => {
    return orders.map((o) => ({
      ...o,
      status: normalizeStatus(o.status),
      type: normalizeType(o.type),
      priority: normalizePriority(o.priority),
      // поддержка старых полей:
      equipment: o.equipment || o.equipmentName || "—",
      date: o.date || o.createdAt || "—",
      location: o.location || "—",
    }))
  }, [orders])

  const stats = calcKpi(safeOrders)
  const emergencies = emergencyByEquipment(safeOrders)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Главное
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard
          title="Всего заявок"
          value={stats.total}
          color="text-slate-900"
          icon={ClipboardList}
        />
        <KpiCard
          title="Открытые"
          value={stats.open}
          color="text-yellow-600"
          icon={AlertTriangle}
        />
        <KpiCard
          title="В работе"
          value={stats.inProgress}
          color="text-blue-600"
          icon={Wrench}
        />
        <KpiCard
          title="Завершены"
          value={stats.done}
          color="text-green-600"
          icon={CheckCircle}
        />
        <KpiCard
          title="Аварии"
          value={stats.emergencies}
          color="text-red-600"
          icon={Flame}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StatusChart stats={stats} />
        <EmergencyTable data={emergencies} />
      </div>
    </div>
  )
}
