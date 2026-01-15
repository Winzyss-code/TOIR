import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Calendar, AlertCircle } from "lucide-react"
import { api } from "../services/api"
import Badge from "../components/Badge"

const frequencyTypeLabel = {
  hours: 'часов',
  days: 'дней',
  weeks: 'недель',
  months: 'месяцев'
}

export default function MaintenancePlans() {
  const [plans, setPlans] = useState([])
  const [equipment, setEquipment] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    equipment_node_id: '',
    equipment_name: '',
    frequency_type: 'weeks',
    frequency_value: 1,
    description: ''
  })

  const user = JSON.parse(localStorage.getItem("cmms_user") || "{}")
  const isAdmin = user.role === "admin"

  useEffect(() => {
    loadPlans()
    loadEquipment()
  }, [])

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/maintenance-plans')
      setPlans(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Error loading plans:', err)
      setPlans([])
    }
    setIsLoading(false)
  }

  const loadEquipment = async () => {
    try {
      const response = await api.get('/equipment')
      setEquipment(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Error loading equipment:', err)
      setEquipment([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.equipment_node_id || !formData.frequency_value) {
      alert('Заполните все обязательные поля')
      return
    }

    try {
      if (editingId) {
        await api.put(`/maintenance-plans/${editingId}`, formData)
        alert('График обновлен')
      } else {
        await api.post('/maintenance-plans', formData)
        alert('График создан')
      }
      
      setFormData({
        equipment_node_id: '',
        equipment_name: '',
        frequency_type: 'weeks',
        frequency_value: 1,
        description: ''
      })
      setEditingId(null)
      setIsModalOpen(false)
      loadPlans()
    } catch (err) {
      console.error('Error saving plan:', err)
      alert('Ошибка при сохранении')
    }
  }

  const handleEdit = (plan) => {
    setFormData({
      equipment_node_id: plan.equipment_node_id,
      equipment_name: plan.equipment_name,
      frequency_type: plan.frequency_type,
      frequency_value: plan.frequency_value,
      description: plan.description
    })
    setEditingId(plan.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот график?')) return
    
    try {
      await api.delete(`/maintenance-plans/${id}`)
      alert('График удален')
      loadPlans()
    } catch (err) {
      console.error('Error deleting plan:', err)
      alert('Ошибка при удалении')
    }
  }

  const handleCreateOrders = async () => {
    if (!confirm('Создать заявки по всем активным графикам?')) return
    
    try {
      const result = await MaintenancePlansService.autoCreateOrders()
      alert(`Создано новых заявок: ${result.count}`)
      loadPlans()
    } catch (err) {
      console.error('Error creating orders:', err)
      alert('Ошибка при создании заявок')
    }
  }

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusBadge = (dueDate) => {
    const days = getDaysUntilDue(dueDate)
    if (days < 0) return { label: 'Просрочено', color: 'red' }
    if (days <= 3) return { label: 'Срочно', color: 'red' }
    if (days <= 7) return { label: 'Скоро', color: 'yellow' }
    return { label: 'В норме', color: 'green' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Графики ТО
          </h1>
          <p className="text-sm text-gray-500">Плановое техническое обслуживание оборудования</p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleCreateOrders}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              <AlertCircle size={16} />
              Создать заявки
            </button>
            <button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  equipment_node_id: '',
                  equipment_name: '',
                  frequency_type: 'weeks',
                  frequency_value: 1,
                  description: ''
                })
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800"
            >
              <Plus size={16} />
              Новый график
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-gray-500">Загрузка...</div>
        ) : plans.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Графики ТО не созданы
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Оборудование</th>
                <th className="px-4 py-3 text-center">Периодичность</th>
                <th className="px-4 py-3 text-center">Описание</th>
                <th className="px-4 py-3 text-center">След. ТО</th>
                <th className="px-4 py-3 text-center">Статус</th>
                <th className="px-4 py-3 text-center">Действия</th>
              </tr>
            </thead>

            <tbody>
              {plans.map((plan) => {
                const status = getStatusBadge(plan.next_due_date)
                const daysLeft = getDaysUntilDue(plan.next_due_date)
                const dueDateStr = plan.next_due_date ? new Date(plan.next_due_date).toLocaleDateString('ru-RU') : '—'

                return (
                  <tr key={plan.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{plan.equipment_name}</div>
                      {plan.created_by_name && (
                        <div className="text-xs text-gray-500">Автор: {plan.created_by_name}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="text-sm">
                        Каждые <strong>{plan.frequency_value}</strong> {frequencyTypeLabel[plan.frequency_type] || plan.frequency_type}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {plan.description || '—'}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-medium">{dueDateStr}</div>
                        {daysLeft !== null && (
                          <div className={`text-xs ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {daysLeft < 0 ? `Просрочено на ${-daysLeft} дн.` : `Через ${daysLeft} дн.`}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge color={status.color}>
                        {status.label}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isAdmin && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          
          <form
            onSubmit={handleSubmit}
            className="relative bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4 z-10"
          >
            <h2 className="text-lg font-semibold">
              {editingId ? 'Редактировать график' : 'Новый график ТО'}
            </h2>

            <div>
              <label className="text-sm text-gray-600">Оборудование *</label>
              <select
                value={formData.equipment_node_id}
                onChange={(e) => {
                  const selectedEquip = equipment.find(eq => eq.id === e.target.value)
                  setFormData({
                    ...formData,
                    equipment_node_id: e.target.value,
                    equipment_name: selectedEquip?.name || ''
                  })
                }}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">-- Выберите оборудование --</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Периодичность *</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={formData.frequency_value}
                  onChange={(e) => setFormData({ ...formData, frequency_value: parseInt(e.target.value) })}
                  className="flex-1 border rounded-md px-2 py-2 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 28, 30].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <select
                  value={formData.frequency_type}
                  onChange={(e) => setFormData({ ...formData, frequency_type: e.target.value })}
                  className="flex-1 border rounded-md px-2 py-2 text-sm"
                >
                  <option value="days">дней</option>
                  <option value="weeks">недель</option>
                  <option value="months">месяцев</option>
                  <option value="hours">часов</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Описание работ</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Что нужно делать при обслуживании?"
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800"
              >
                {editingId ? 'Обновить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
