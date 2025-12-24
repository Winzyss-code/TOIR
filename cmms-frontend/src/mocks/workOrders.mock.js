import { WorkOrderStatus, WorkOrderPriority } from "../contracts/workOrder.contract"

export const workOrdersMock = [
  {
    id: 1,
    equipmentName: "Насос P-100",
    type: "emergency",
    priority: WorkOrderPriority.HIGH,
    status: WorkOrderStatus.OPEN,
    createdAt: "2025-03-01"
  },
  {
    id: 2,
    equipmentName: "Компрессор C-20",
    type: "planned",
    priority: WorkOrderPriority.MEDIUM,
    status: WorkOrderStatus.IN_PROGRESS,
    createdAt: "2025-03-02"
  },
  {
    id: 3,
    equipmentName: "Генератор G-5",
    type: "planned",
    priority: WorkOrderPriority.LOW,
    status: WorkOrderStatus.DONE,
    createdAt: "2025-02-25"
  }
]
