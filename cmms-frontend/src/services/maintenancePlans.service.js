const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function getAuthHeader() {
  const token = localStorage.getItem('cmms_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const MaintenancePlansService = {
  getAll() {
    return fetch(`${API_URL}/maintenance-plans`, {
      headers: getAuthHeader()
    }).then(r => r.json())
  },

  getById(id) {
    return fetch(`${API_URL}/maintenance-plans/${id}`, {
      headers: getAuthHeader()
    }).then(r => r.json())
  },

  create(plan) {
    return fetch(`${API_URL}/maintenance-plans`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(plan)
    }).then(r => r.json())
  },

  update(id, updates) {
    return fetch(`${API_URL}/maintenance-plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    }).then(r => r.json())
  },

  delete(id) {
    return fetch(`${API_URL}/maintenance-plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }).then(r => r.json())
  },

  autoCreateOrders() {
    return fetch(`${API_URL}/maintenance-plans/auto-create-orders`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(r => r.json())
  }
}
