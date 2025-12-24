import { createBrowserRouter } from "react-router-dom"
import AppLayout from "./layout"
import ProtectedRoute from "../app/ProtectedRoute"

import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import Equipment from "../pages/Equipment"
import WorkOrders from "../pages/WorkOrders"
import Reports from "../pages/Reports"
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "equipment", element: <Equipment /> },
      { path: "work-orders", element: <WorkOrders /> },
      { path: "reports", element: <Reports /> },

    ],
  },
])
