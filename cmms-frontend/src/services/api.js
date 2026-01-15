import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:3000/api" // backend
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem("cmms_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
