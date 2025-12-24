const STORAGE_KEY = "cmms_work_orders"

function load() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const WorkOrdersService = {
  getAll() {
    return Promise.resolve(load())
  },

  create(order) {
    const orders = load()

    const newOrder = {
      id: crypto.randomUUID(),
      ...order,
    }

    orders.unshift(newOrder)
    save(orders)

    return Promise.resolve(newOrder)
  },

  update(id, updates) {
    const orders = load().map(o =>
      o.id === id ? { ...o, ...updates } : o
    )
    save(orders)
    return Promise.resolve()
  },

  remove(id) {
    const orders = load().filter(o => o.id !== id)
    save(orders)
    return Promise.resolve()
  },
}
