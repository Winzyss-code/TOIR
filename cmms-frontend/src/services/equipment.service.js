import { equipmentMock } from "../mocks/equipment.mock"

export const EquipmentService = {
  async getAll() {
    return Promise.resolve(equipmentMock)
  },

  async create(data) {
    return Promise.resolve({ ...data, id: Date.now() })
  }
}

