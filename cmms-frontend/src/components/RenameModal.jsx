import { useEffect, useState } from "react"
import { X } from "lucide-react"

export default function RenameModal({ open, initial, title, onClose, onSave }) {
  const [value, setValue] = useState(initial || "")

  useEffect(() => {
    setValue(initial || "")
  }, [initial])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-lg p-5 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <input
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 text-sm border rounded-md" onClick={onClose}>
            Отмена
          </button>
          <button
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md"
            onClick={() => onSave(value.trim())}
            disabled={!value.trim()}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
