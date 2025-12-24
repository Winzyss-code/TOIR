import { WorkOrderPriority } from "../contracts/workOrder.contract"

export function initWorkOrders() {
  if (localStorage.getItem("cmms_work_orders")) return

  localStorage.setItem(
    "cmms_work_orders",
    JSON.stringify([
      {
        id: crypto.randomUUID(),
        equipment: "Насос P-100",
        location: "Цех №1",
        type: "Emergency",
        priority: WorkOrderPriority.HIGH,
        status: "Open",
        date: "2025-03-01",
      },
      {
        id: crypto.randomUUID(),
        equipment: "Компрессор C-20",
        location: "Цех №2",
        type: "Planned",
        priority: WorkOrderPriority.MEDIUM,
        status: "In Progress",
        date: "2025-03-02",
      },
    ])
  )
}
