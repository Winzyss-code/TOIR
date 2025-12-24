import { WorkOrderStatus } from "../contracts/workOrder.contract"

export function getNextStatus(current) {
  switch (current) {
    case WorkOrderStatus.OPEN:
      return WorkOrderStatus.IN_PROGRESS
    case WorkOrderStatus.IN_PROGRESS:
      return WorkOrderStatus.DONE
    default:
      return null
  }
}
