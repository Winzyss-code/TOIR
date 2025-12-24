import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "./app/router"
import "./index.css"
import { initWorkOrders } from "./app/initWorkOrders"
initWorkOrders()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
