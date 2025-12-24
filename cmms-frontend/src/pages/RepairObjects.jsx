import { useMemo, useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Package,
  Search,
  Plus,
  Trash2,
  Pencil,
  RefreshCcw,
} from "lucide-react"

const DATA = [
  {
    id: "root",
    name: "Структура основная",
    type: "folder",
    children: [
      {
        id: "eq-ind",
        name: "Оборудование общепромышленное",
        type: "folder",
        children: [
          {
            id: "line-1",
            name: "Производственные линии",
            type: "folder",
            children: [
              {
                id: "asm-1",
                name: "Линия сборки №1",
                type: "asset",
                code: "L-001",
                inv: "INV-1001",
                serial: "SN-88421",
                location: "Цех №1",
                children: [
                  {
                    id: "gear",
                    name: "Редуктор",
                    type: "asset",
                    code: "R-10",
                    inv: "INV-204",
                    serial: "SN-2211",
                    location: "Цех №1",
                    children: [
                      {
                        id: "bearing",
                        name: "Подшипник",
                        type: "asset",
                        code: "B-7",
                        inv: "INV-777",
                        serial: "SN-7777",
                        location: "Цех №1",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

function flatten(root) {
  const out = []
  const walk = (n, parentId = null, level = 0) => {
    out.push({ ...n, parentId, level })
    ;(n.children || []).forEach((c) => walk(c, n.id, level + 1))
  }
  walk(root)
  return out
}

function findNodeById(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const r = findNodeById(n.children, id)
      if (r) return r
    }
  }
  return null
}

function TreeNode({ node, level, expanded, toggle, selectedId, onSelect }) {
  const isFolder = node.type === "folder"
  const hasChildren = (node.children?.length || 0) > 0
  const isOpen = expanded.has(node.id)

  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer select-none
      ${selectedId === node.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
      style={{ paddingLeft: 8 + level * 16 }}
      onClick={() => onSelect(node.id)}
    >
      {/* expand icon */}
      <button
        type="button"
        className="w-5 h-5 flex items-center justify-center text-gray-500"
        onClick={(e) => {
          e.stopPropagation()
          if (hasChildren) toggle(node.id)
        }}
      >
        {hasChildren ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
      </button>

      {/* item icon */}
      {isFolder ? (
        <Folder className="text-amber-500" size={18} />
      ) : (
        <Package className="text-slate-500" size={18} />
      )}

      <span className="text-sm">{node.name}</span>
    </div>
  )
}

export default function RepairObjects() {
  const root = DATA[0]
  const [expanded, setExpanded] = useState(new Set(["root", "eq-ind", "line-1"]))
  const [selectedId, setSelectedId] = useState("bearing")
  const [q, setQ] = useState("")

  const selected = useMemo(() => findNodeById([root], selectedId), [selectedId])
  const flat = useMemo(() => flatten(root), [root])

  const filteredIds = useMemo(() => {
    if (!q.trim()) return null
    const query = q.toLowerCase()
    return new Set(
      flat
        .filter((n) => n.name.toLowerCase().includes(query))
        .map((n) => n.id)
    )
  }, [q, flat])

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderTree = (node, level = 0) => {
    // search filter: show only matching nodes + their parents
    const show =
      !filteredIds ||
      filteredIds.has(node.id) ||
      (node.children || []).some((c) => filteredIds.has(c.id))

    if (!show) return null

    const isOpen = expanded.has(node.id)

    return (
      <div key={node.id}>
        <TreeNode
          node={node}
          level={level}
          expanded={expanded}
          toggle={toggle}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {isOpen &&
          (node.children || []).map((c) => renderTree(c, level + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* top title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Объекты ремонта</h1>
          <p className="text-sm text-gray-500">Дерево оборудования и карточка выбранного объекта</p>
        </div>
      </div>

      {/* toolbar */}
      <div className="bg-white border rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-gray-50 border">
            <Plus size={16} />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-50 border">
            <Pencil size={16} />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-50 border">
            <Trash2 size={16} />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-50 border">
            <RefreshCcw size={16} />
          </button>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск (Ctrl+F)"
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      {/* main split */}
      <div className="grid grid-cols-12 gap-6">
        {/* left tree */}
        <div className="col-span-12 lg:col-span-5 bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold text-sm bg-gray-50">
            Структура
          </div>
          <div className="p-2 max-h-[520px] overflow-auto">
            {renderTree(root)}
          </div>
        </div>

        {/* right table */}
        <div className="col-span-12 lg:col-span-7 bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold text-sm bg-gray-50">
            Карточка объекта
          </div>

          <div className="p-4">
            <div className="mb-4">
              <div className="text-sm text-gray-500">Выбрано</div>
              <div className="text-lg font-semibold">{selected?.name || "—"}</div>
            </div>

            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3">Поле</th>
                    <th className="text-left px-4 py-3">Значение</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Код", selected?.code],
                    ["Инвентарный №", selected?.inv],
                    ["Заводской №", selected?.serial],
                    ["Расположение", selected?.location],
                    ["Тип", selected?.type === "folder" ? "Папка" : "Оборудование"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-t">
                      <td className="px-4 py-3 text-gray-500">{k}</td>
                      <td className="px-4 py-3 font-medium">{v || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Позже сюда можно добавить вкладки: ТО, заявки, история ремонтов, документы.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
