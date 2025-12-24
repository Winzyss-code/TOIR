import { useState } from "react"
import { X, Wrench, AlertTriangle, Flag } from "lucide-react"
import { WorkOrdersService } from "../services/workOrders.service"
import { WorkOrderPriority } from "../contracts/workOrder.contract"

export default function CreateWorkOrderModal({ isOpen, onClose, onCreated }) {
  const [equipment, setEquipment] = useState("")
  const [type, setType] = useState("planned")
  const [priority, setPriority] = useState(WorkOrderPriority.MEDIUM)

  if (!isOpen) return null

  const submit = async (e) => {
    e.preventDefault()

    const newOrder = await WorkOrdersService.create({
      equipment: equipment,
      location: "—",
      type: type === "emergency" ? "Emergency" : "Planned",
      priority,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
})

    onCreated(newOrder)
    onClose()

    setEquipment("")
    setType("planned")
    setPriority(WorkOrderPriority.MEDIUM)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        className="relative bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-5 z-10"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Создать заявку
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-500">
            Оборудование
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Например: Насос P-100"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-500 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            Тип заявки
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="planned">Плановое ТО</option>
            <option value="emergency">Авария</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-500 flex items-center gap-1">
            <Flag className="w-4 h-4 text-gray-400" />
            Приоритет
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value={WorkOrderPriority.LOW}>Низкий</option>
            <option value={WorkOrderPriority.MEDIUM}>Средний</option>
            <option value={WorkOrderPriority.HIGH}>Высокий</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800"
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  )
}
