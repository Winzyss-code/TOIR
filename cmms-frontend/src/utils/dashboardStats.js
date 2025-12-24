function normStatus(status) {
  const s = String(status || "").toLowerCase()
  if (s === "open") return "open"
  if (s === "in_progress" || s === "in progress" || s === "inprogress") return "in_progress"
  if (s === "done" || s === "completed" || s === "complete") return "done"
  return "open"
}

function normType(type) {
  const t = String(type || "").toLowerCase()
  if (t === "emergency" || t === "breakdown") return "emergency"
  if (t === "planned" || t === "plan") return "planned"
  return "planned"
}

export function calcKpi(orders = []) {
  const stats = {
    total: orders.length,
    open: 0,
    inProgress: 0,
    done: 0,
    emergencies: 0,
  }

  for (const o of orders) {
    const status = normStatus(o.status)
    const type = normType(o.type)

    if (status === "open") stats.open++
    if (status === "in_progress") stats.inProgress++
    if (status === "done") stats.done++

    if (type === "emergency") stats.emergencies++
  }

  return stats
}

export function emergencyByEquipment(orders = []) {
  const map = new Map()

  for (const o of orders) {
    const type = normType(o.type)
    if (type !== "emergency") continue

    const eq = o.equipment || o.equipmentName || "—"
    map.set(eq, (map.get(eq) || 0) + 1)
  }

  return Array.from(map.entries()).map(([equipment, count]) => ({
    equipment,
    count,
  }))
}
