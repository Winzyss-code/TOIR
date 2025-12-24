import { useMemo, useRef, useState } from "react"
import { Tree } from "react-arborist"
import {
  Folder,
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  FolderPlus,
  Box,
  MoreVertical,
} from "lucide-react"

function NodeRow({ node, style, dragHandle, onSelect, selectedId, onAction }) {
  const isFolder = node.data.type === "folder"
  const isSelected = selectedId === node.id

  return (
    <div
      style={style}
      className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer
      ${isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div {...dragHandle} className="text-gray-400">
          <MoreVertical size={14} />
        </div>

        {isFolder ? (
          <Folder className="text-amber-500 shrink-0" size={18} />
        ) : (
          <Package className="text-slate-500 shrink-0" size={18} />
        )}

        <span className="text-sm truncate">{node.data.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-1 rounded hover:bg-gray-100"
          title="Переименовать"
          onClick={(e) => {
            e.stopPropagation()
            onAction("rename", node.id)
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          className="p-1 rounded hover:bg-gray-100 text-red-600"
          title="Удалить"
          onClick={(e) => {
            e.stopPropagation()
            onAction("delete", node.id)
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function EquipmentTree({
  data,
  selectedId,
  onSelect,
  onAddFolder,
  onAddAsset,
  onRename,
  onDelete,
  onReset,
  onMove,
}) {
  const ref = useRef(null)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    // Arborist filter via search prop, we just pass query
    return data
  }, [data, query])

  const handleAction = (type, id) => {
    if (type === "rename") onRename(id)
    if (type === "delete") onDelete(id)
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* header */}
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="font-semibold text-sm">Структура</div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md border hover:bg-white"
            title="Добавить папку"
            onClick={() => onAddFolder(selectedId || "root")}
          >
            <FolderPlus size={16} />
          </button>
          <button
            className="p-2 rounded-md border hover:bg-white"
            title="Добавить объект"
            onClick={() => onAddAsset(selectedId || "root")}
          >
            <Box size={16} />
          </button>
          <button
            className="p-2 rounded-md border hover:bg-white"
            title="Сбросить"
            onClick={onReset}
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* search */}
      <div className="p-3 border-b">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по дереву..."
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="h-[520px] overflow-hidden">
        <Tree
          ref={ref}
          data={[filtered]}
          openByDefault={true}
          width={"100%"}
          height={520}
          indent={18}
          rowHeight={36}
          searchTerm={query}
          searchMatch={(node, term) =>
            node.data.name?.toLowerCase().includes(term.toLowerCase())
          }
          onMove={onMove}
        >
          {(props) => (
            <NodeRow
              {...props}
              selectedId={selectedId}
              onSelect={onSelect}
              onAction={handleAction}
            />
          )}
        </Tree>
      </div>
    </div>
  )
}
