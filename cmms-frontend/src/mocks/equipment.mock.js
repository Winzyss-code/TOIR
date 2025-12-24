import { EquipmentStatus } from "../contracts/equipment.contract"

export const equipmentMock = [
  {
    id: 1,
    name: "Насос P-100",
    type: "Pump",
    location: "Цех 1",
    status: EquipmentStatus.WORKING
  },
  {
    id: 2,
    name: "Компрессор C-20",
    type: "Compressor",
    location: "Цех 2",
    status: EquipmentStatus.MAINTENANCE
  }
]

