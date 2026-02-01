import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Package } from "lucide-react"
import { EquipmentTreeService } from "../services/equipmentTree.service"
import Badge from "../components/Badge"
import { useNavigate } from "react-router-dom"

export default function Equipment() {
  const [tree, setTree] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    node_type: 'asset',
    code: '',
    inv: '',
    serial: '',
    location: ''
  })

  const navigate = useNavigate()
  const [draggedId, setDraggedId] = useState(null)


  useEffect(() => {
    loadTree()
  }, [])

  const loadTree = async () => {
    try {
      const data = await EquipmentTreeService.getTree()
      setTree(data)
      if (!selectedId) setSelectedId(data?.id)
    } catch (err) {
      console.error('Error loading equipment:', err)
    }
  }

  const findNode = (node, id) => {
    if (!node) return null
    if (node.id === id) return node
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedNode = tree ? findNode(tree, selectedId) : null

  const handleAdd = (type) => {
    setFormData({
      name: type === 'folder' ? 'Новая папка' : 'Новое оборудование',
      node_type: type,
      code: '',
      inv: '',
      serial: '',
      location: ''
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEdit = () => {
    if (!selectedNode || selectedNode.id === 'root') return
    setFormData({
      name: selectedNode.name,
      node_type: selectedNode.type,
      code: selectedNode.code || '',
      inv: selectedNode.inv || '',
      serial: selectedNode.serial || '',
      location: selectedNode.location || ''
    })
    setEditingId(selectedNode.id)
    setIsModalOpen(true)
  }
  const removeNode = (node, id) => {
  if (!node.children) return node

  node.children = node.children.filter(child => child.id !== id)
  node.children.forEach(child => removeNode(child, id))
  return node
}

const findNodeById = (node, id) => {
  if (node.id === id) return node
  for (const child of node.children || []) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}



  const handleDrop = (targetId) => {
  if (!draggedId || draggedId === targetId) return

  const newTree = structuredClone(tree)

  const draggedNode = findNodeById(newTree, draggedId)
  const targetNode = findNodeById(newTree, targetId)

  if (!draggedNode || !targetNode) return

  // ❌ нельзя кидать внутрь asset
  if (targetNode.type === 'asset') return

  // удаляем из старого места
  removeNode(newTree, draggedId)

  // добавляем в новое
  targetNode.children = targetNode.children || []
  targetNode.children.push(draggedNode)

  setTree(newTree)
  setDraggedId(null)
}

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Update
        await EquipmentTreeService.updateNode({
          id: editingId,
          patch: {
            name: formData.name,
            code: formData.code || null,
            inv: formData.inv || null,
            serial: formData.serial || null,
            location: formData.location || null
          }
        })
        alert('Оборудование обновлено')
      } else {
        // Create
        const parentId = selectedId || 'root'
        await EquipmentTreeService.addNode({
          parentId,
          node: {
            name: formData.name,
            type: formData.node_type,
            code: formData.code || null,
            inv: formData.inv || null,
            serial: formData.serial || null,
            location: formData.location || null,
            children: []
          }
        })
        alert('Оборудование создано')
      }

      setIsModalOpen(false)
      loadTree()
    } catch (err) {
      console.error('Error saving:', err)
      alert('Ошибка при сохранении')
    }
  }

  const handleDelete = async () => {
    if (!selectedNode || selectedNode.id === 'root') return
    if (!confirm('Удалить это оборудование и все его компоненты?')) return

    try {
      await EquipmentTreeService.deleteNode({ id: selectedNode.id })
      alert('Оборудование удалено')
      setSelectedId('root')
      loadTree()
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Ошибка при удалении')
    }
  }

  const renderTree = (node, depth = 0) => {
    if (!node) return null

    const isSelected = node.id === selectedId
    const isAsset = node.type === 'asset'

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div
            draggable
            onDragStart={() => setDraggedId(node.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(node.id)}
            onClick={() => setSelectedId(node.id)}
            onDoubleClick={() => {
            if (node.type === "asset") {
                navigate(`/equipment/${node.id}`)
              }
              }}
  
  className={`py-2 px-3 rounded cursor-pointer flex items-center gap-2 ${
    isSelected ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100'
  }`}
>

          <Package size={18} className={isAsset ? 'text-orange-500' : 'text-gray-500'} />
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            {isAsset && node.code && (
              <div className="text-xs text-gray-500">{node.code}</div>
            )}
          </div>
          {isAsset && <Badge color="orange">{node.type}</Badge>}
        </div>

        {node.children && node.children.map(child => renderTree(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Оборудование
          </h1>
          <p className="text-sm text-gray-500">Иерархия оборудования и компонентов</p>
        </div>

        <div className="flex gap-2">
          {selectedNode && selectedNode.id !== 'root' && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
            >
              <Trash2 size={16} />
              Удалить
            </button>
          )}
          {selectedNode && selectedNode.id !== 'root' && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              <Edit2 size={16} />
              Редактировать
            </button>
          )}
          <button
            onClick={() => handleAdd('folder')}
            className="flex items-center gap-2 bg-slate-600 text-white px-3 py-2 rounded-md text-sm hover:bg-slate-700"
          >
            <Plus size={16} />
            Папка
          </button>
          <button
            onClick={() => handleAdd('asset')}
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-md text-sm hover:bg-slate-800"
          >
            <Plus size={16} />
            Оборудование
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tree */}
        <div className="col-span-2 bg-white rounded-xl border p-4 max-h-96 overflow-y-auto">
          {tree ? renderTree(tree) : <div className="text-gray-500">Загрузка...</div>}
        </div>

        {/* Properties panel */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-4">Свойства</h3>
          {selectedNode ? (
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">Название</label>
                <div className="font-medium">{selectedNode.name}</div>
              </div>
              {selectedNode.type === 'asset' && (
                <>
                  <div>
                    <label className="text-gray-600">Код</label>
                    <div className="font-medium">{selectedNode.code || '—'}</div>
                  </div>
                  <div>
                    <label className="text-gray-600">Инв. номер</label>
                    <div className="font-medium">{selectedNode.inv || '—'}</div>
                  </div>
                  <div>
                    <label className="text-gray-600">Серийный номер</label>
                    <div className="font-medium">{selectedNode.serial || '—'}</div>
                  </div>
                  <div>
                    <label className="text-gray-600">Местоположение</label>
                    <div className="font-medium">{selectedNode.location || '—'}</div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Ничего не выбрано</div>
          )}
        </div>
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
              {editingId ? 'Редактировать' : `Добавить ${formData.node_type === 'folder' ? 'папку' : 'оборудование'}`}
            </h2>

            <div>
              <label className="text-sm text-gray-600">Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                required
              />
            </div>

            {formData.node_type === 'asset' && (
              <>
                <div>
                  <label className="text-sm text-gray-600">Код оборудования</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Например: P-100"
                    className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Инвентарный номер</label>
                  <input
                    type="text"
                    value={formData.inv}
                    onChange={(e) => setFormData({ ...formData, inv: e.target.value })}
                    placeholder="Например: INV-001"
                    className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Серийный номер</label>
                  <input
                    type="text"
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    placeholder="Например: SN-123456"
                    className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Местоположение</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Например: Цех №1"
                    className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>
              </>
            )}

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
