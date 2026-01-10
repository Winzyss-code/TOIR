import { api } from '../services/api'

export const auth = {
  isAuthenticated() {
    return localStorage.getItem("cmms_token") !== null
  },

  async login(username, password) {
    const response = await api.post('/auth/login', { username, password })
    const { token, user } = response.data
    localStorage.setItem("cmms_token", token)
    localStorage.setItem("cmms_user", JSON.stringify(user))
    return { token, user }
  },

  logout() {
    localStorage.removeItem("cmms_token")
    localStorage.removeItem("cmms_user")
  },

  getUser() {
    const user = localStorage.getItem("cmms_user")
    return user ? JSON.parse(user) : null
  },

  getToken() {
    return localStorage.getItem("cmms_token")
  }
}

