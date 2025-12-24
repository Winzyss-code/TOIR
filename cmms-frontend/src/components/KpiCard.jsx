import { TrendingUp } from "lucide-react"

export default function KpiCard({ title, value, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-gray-100">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
