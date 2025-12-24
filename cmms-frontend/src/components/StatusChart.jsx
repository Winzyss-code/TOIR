import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function StatusChart({ stats }) {
  // защита от undefined/NaN
  const open = Number(stats?.open ?? 0)
  const inProgress = Number(stats?.inProgress ?? 0)
  const done = Number(stats?.done ?? 0)
  const emergencies = Number(stats?.emergencies ?? 0)

  const data = {
    labels: ["Открытые", "В работе", "Завершены", "Аварии"],
    datasets: [
      {
        data: [open, inProgress, done, emergencies],
        backgroundColor: ["#facc15", "#3b82f6", "#22c55e", "#ef4444"],
        borderWidth: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 ключ
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 14, padding: 14 },
      },
      tooltip: { enabled: true },
    },
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-lg mb-4">Статусы заявок</h2>

      {/* 🔥 фиксируем высоту для canvas */}
      <div className="relative h-[320px]">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}
