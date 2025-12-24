import { Navigate } from "react-router-dom"
import { auth } from "./auth"

export default function ProtectedRoute({ children }) {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}
