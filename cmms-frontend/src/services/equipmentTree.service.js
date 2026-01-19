const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function getAuthHeader() {
  const token = localStorage.getItem('cmms_token')
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }
}

/* =========================
   MOCK DATA (fallback)
   ========================= */
const mockNodes = [
  {
    id: 1,
    parent_id: null,
    name: 'Цех №1',
    node_type: 'location',
    code: null,
    inv: null,
    serial: null,
    location: 'Завод'
  },
  {
    id: 2,
    parent_id: 1,
    name: 'Насос P-100',
    node_type: 'equipment',
    code: 'P-100',
    inv: 'INV-001',
    serial: 'SN-123',
    location: 'Цех №1'
  }
]

// Преобразуем плоский список узлов в дерево
function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => n.parent_id === parentId)
    .map(node => ({
      id: node.id,
      name: node.name,
      type: node.node_type,
      code: node.code,
      inv: node.inv,
      serial: node.serial,
      location: node.location,
      children: buildTree(nodes, node.id)
    }))
}

export const EquipmentTreeService = {
  /* =========================
     GET TREE
     ========================= */
  async getTree() {
    try {
      const response = await fetch(`${API_URL}/equipment/tree`, {
        headers: getAuthHeader()
      })

      if (!response.ok) throw new Error('API error')

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Backend not ready, using mock tree')
      return buildTree(mockNodes)
    }
  },

  /* =========================
     GET ALL NODES
     ========================= */
  async getNodes() {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes`, {
        headers: getAuthHeader()
      })

      if (!response.ok) throw new Error('API error')

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Backend not ready, using mock nodes')
      return mockNodes
    }
  },

  /* =========================
     GET NODE BY ID (FIX)
     ========================= */
  async getNodeById(id) {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes/${id}`, {
        headers: getAuthHeader()
      })

      if (!response.ok) throw new Error('API error')

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Backend not ready, using mock node')
      return mockNodes.find(n => n.id === Number(id)) || null
    }
  },

  /* =========================
     ADD NODE
     ========================= */
  async addNode({ parentId, node }) {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          parent_id: parentId,
          name: node.name,
          node_type: node.type,
          code: node.code || null,
          inv: node.inv || null,
          serial: node.serial || null,
          location: node.location || null
        })
      })

      if (!response.ok) throw new Error('API error')

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Backend not ready, mock add')
      const newNode = {
        id: Date.now(),
        parent_id: parentId,
        ...node
      }
      mockNodes.push(newNode)
      return newNode
    }
  },

  /* =========================
     UPDATE NODE
     ========================= */
  async updateNode(id, updates) {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('API error')

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Backend not ready, mock update')
      const node = mockNodes.find(n => n.id === Number(id))
      if (node) Object.assign(node, updates)
      return node
    }
  },

  /* =========================
     DELETE NODE
     ========================= */
  async deleteNode(id) {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (!response.ok) throw new Error('API error')

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Backend not ready, mock delete')
      const index = mockNodes.findIndex(n => n.id === Number(id))
      if (index !== -1) mockNodes.splice(index, 1)
      return { success: true }
    }
  }
}
