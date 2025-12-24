export const auth = {
  isAuthenticated() {
    return localStorage.getItem("cmms_token") !== null
  },

  login() {
    localStorage.setItem("cmms_token", "mock-token")
  },

  logout() {
    localStorage.removeItem("cmms_token")
  },
}

