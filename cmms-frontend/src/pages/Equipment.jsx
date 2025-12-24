import { useEffect, useMemo, useState } from "react"
import EquipmentTree from "../components/EquipmentTree"
import RenameModal from "../components/RenameModal"
import { EquipmentTreeService } from "../services/equipmentTree.service"
import { Package } from "lucide-react"

function findNode(root, id) {
  if (!root) return null
  if (root.id === id) return root
  for (const c of root.children || []) {
    const r = findNode(c, id)
    if (r) return r
  }
  return null
}

export default function Equipment() {
  const [tree, setTree] = useState(null)
  const [selectedId, setSelectedId] = useState("root")

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTargetId, setRenameTargetId] = useState(null)

  useEffect(() => {
    EquipmentTreeService.getTree().then((t) => {
      setTree(t)
      setSelectedId(t?.id || "root")
    })
  }, [])

  const selected = useMemo(
    () => (tree ? findNode(tree, selectedId) : null),
    [tree, selectedId]
  )

  const openRename = (id) => {
    setRenameTargetId(id)
    setRenameOpen(true)
  }

  const addFolder = async (parentId) => {
    const parent = findNode(tree, parentId) || tree
    const newNode = await EquipmentTreeService.addNode({
      parentId: parent.id,
      node: { name: "Новая папка", type: "folder", children: [] },
    })
    const next = await EquipmentTreeService.getTree()
    setTree(next)
    setSelectedId(newNode.id)
    openRename(newNode.id)
  }

  const addAsset = async (parentId) => {
    const parent = findNode(tree, parentId) || tree
    const newNode = await EquipmentTreeService.addNode({
      parentId: parent.id,
      node: {
        name: "Новый объект",
        type: "asset",
        code: "",
        inv: "",
        serial: "",
        location: "",
        children: [],
      },
    })
    const next = await EquipmentTreeService.getTree()
    setTree(next)
    setSelectedId(newNode.id)
    openRename(newNode.id)
  }

  const rename = async (id, name) => {
    await EquipmentTreeService.renameNode({ id, name })
    setTree(await EquipmentTreeService.getTree())
  }

  const remove = async (id) => {
    if (id === "root") return
    const ok = confirm("Удалить выбранный узел и все дочерние элементы?")
    if (!ok) return
    await EquipmentTreeService.deleteNode({ id })
    const next = await EquipmentTreeService.getTree()
    setTree(next)
    setSelectedId("root")
  }

  const reset = async () => {
    const ok = confirm("Сбросить дерево к исходному шаблону?")
    if (!ok) return
    const next = await EquipmentTreeService.reset()
    setTree(next)
    setSelectedId("root")
  }

  const onMove = async ({ dragIds, parentId, index }) => {
    // Arborist move event gives you IDs; simplest backend-ready approach:
    // we re-build tree using its own state would be more complex.
    // For MVP: disable move OR implement later.
    // For now: show message.
    console.log("move:", { dragIds, parentId, index })
    alert("Drag&drop перемещение добавим следующим шагом (сейчас только CRUD).")
  }

  const updateSelectedField = async (field, value) => {
    if (!selected?.id || selected.id === "root") return
    await EquipmentTreeService.updateNode({
      id: selected.id,
      patch: { [field]: value },
    })
    setTree(await EquipmentTreeService.getTree())
  }

  if (!tree) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Оборудование</h1>
        <p className="text-sm text-gray-500">
          Дерево оборудования (папки + объекты) и карточка выбранного элемента
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Tree */}
        <div className="col-span-12 lg:col-span-5">
          <EquipmentTree
            data={tree}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddFolder={addFolder}
            onAddAsset={addAsset}
            onRename={openRename}
            onDelete={remove}
            onReset={reset}
            onMove={onMove}
          />
        </div>

        {/* Details */}
        <div className="col-span-12 lg:col-span-7 bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
            <Package size={18} className="text-slate-500" />
            <div className="font-semibold text-sm">Карточка объекта</div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-gray-500">Выбрано</div>
              <div className="text-lg font-semibold">{selected?.name || "—"}</div>
              <div className="text-xs text-gray-400">
                Тип: {selected?.type === "folder" ? "Папка" : "Объект"}
              </div>
            </div>

            {/* fields only for asset */}
            {selected?.type === "asset" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["code", "Код"],
                  ["inv", "Инвентарный №"],
                  ["serial", "Заводской №"],
                  ["location", "Расположение"],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      value={selected?.[key] || ""}
                      onChange={(e) => updateSelectedField(key, e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Выбрана папка. Здесь позже можно показать агрегированную статистику по дочерним объектам.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rename modal */}
      <RenameModal
        open={renameOpen}
        title="Переименовать"
        initial={findNode(tree, renameTargetId)?.name || ""}
        onClose={() => setRenameOpen(false)}
        onSave={async (name) => {
          await rename(renameTargetId, name)
          setRenameOpen(false)
        }}
      />
    </div>
  )
}
