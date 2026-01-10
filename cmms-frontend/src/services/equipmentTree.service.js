const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function getAuthHeader() {
  const token = localStorage.getItem('cmms_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

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
  async getTree() {
    try {
      const response = await fetch(`${API_URL}/equipment/tree`, {
        headers: getAuthHeader()
      })
      return await response.json()
    } catch (err) {
      console.error('Error fetching equipment tree:', err)
      return null
    }
  },

  async getNodes() {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes`, {
        headers: getAuthHeader()
      })
      return await response.json()
    } catch (err) {
      console.error('Error fetching equipment nodes:', err)
      return []
    }
  },

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
      return await response.json()
    } catch (err) {
      console.error('Error adding node:', err)
      throw err
    }
  },

  async updateNode(id, updates) {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(updates)
      })
      return await response.json()
    } catch (err) {
      console.error('Error updating node:', err)
      throw err
    }
  },

  async deleteNode(id) {
    try {
      const response = await fetch(`${API_URL}/equipment/nodes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      return await response.json()
    } catch (err) {
      console.error('Error deleting node:', err)
      throw err
    }
  }
}
