import { createBrowserRouter } from "react-router-dom"
import AppLayout from "./layout"
import ProtectedRoute from "../app/ProtectedRoute"

import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import Equipment from "../pages/Equipment"
import WorkOrders from "../pages/WorkOrders"
import MaintenancePlans from "../pages/MaintenancePlans"
import Reports from "../pages/Reports"
import SpareParts from "../pages/SpareParts"
import Materials from "../pages/Materials"
import MaintenanceTypes from "../pages/MaintenanceTypes"
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
      { path: "maintenance-plans", element: <MaintenancePlans /> },
      { path: "spare-parts", element: <SpareParts /> },
      { path: "materials", element: <Materials /> },
      { path: "maintenance-types", element: <MaintenanceTypes /> },
      { path: "reports", element: <Reports /> },
    ],
  },
])
