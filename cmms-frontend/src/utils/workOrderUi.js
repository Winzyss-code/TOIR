import { WorkOrderStatus } from "../contracts/workOrder.contract"

export const statusColor = {
  [WorkOrderStatus.OPEN]: "bg-yellow-100 text-yellow-800",
  [WorkOrderStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [WorkOrderStatus.DONE]: "bg-green-100 text-green-800",
}

export const statusLabel = {
  [WorkOrderStatus.OPEN]: "Открыта",
  [WorkOrderStatus.IN_PROGRESS]: "В работе",
  [WorkOrderStatus.DONE]: "Завершена",
}

export const priorityColor = {
  low: "text-green-600",
  medium: "text-orange-500",
  high: "text-red-600",
}
