import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
