const STORAGE_KEY = "cmms_equipment_tree_v1"

const DEFAULT_TREE = {
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
          id: "lines",
          name: "Производственные линии",
          type: "folder",
          children: [
            {
              id: "line1",
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
}

const load = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

const save = (tree) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tree))
}

const ensure = () => {
  const existing = load()
  if (!existing) {
    save(DEFAULT_TREE)
    return DEFAULT_TREE
  }
  return existing
}

const walk = (node, fn) => {
  fn(node)
  ;(node.children || []).forEach((c) => walk(c, fn))
}

const findById = (node, id) => {
  if (node.id === id) return node
  for (const c of node.children || []) {
    const r = findById(c, id)
    if (r) return r
  }
  return null
}

const findParent = (node, id, parent = null) => {
  if (node.id === id) return parent
  for (const c of node.children || []) {
    const r = findParent(c, id, node)
    if (r) return r
  }
  return null
}

const removeById = (root, id) => {
  const parent = findParent(root, id)
  if (!parent) return root
  parent.children = (parent.children || []).filter((c) => c.id !== id)
  return root
}

const uuid = () =>
  (crypto?.randomUUID?.() || `id_${Date.now()}_${Math.random().toString(16).slice(2)}`)

export const EquipmentTreeService = {
  // later: replace with axios.get("/equipment-tree")
  async getTree() {
    return ensure()
  },

  // later: replace with axios.put("/equipment-tree", tree)
  async saveTree(tree) {
    save(tree)
    return tree
  },

  async addNode({ parentId, node }) {
    const root = ensure()
    const parent = findById(root, parentId) || root
    parent.children = parent.children || []
    const newNode = { id: uuid(), children: [], ...node }
    parent.children.unshift(newNode)
    save(root)
    return newNode
  },

  async renameNode({ id, name }) {
    const root = ensure()
    const n = findById(root, id)
    if (n) n.name = name
    save(root)
    return n
  },

  async updateNode({ id, patch }) {
    const root = ensure()
    const n = findById(root, id)
    if (n) Object.assign(n, patch)
    save(root)
    return n
  },

  async deleteNode({ id }) {
    const root = ensure()
    const next = removeById(root, id)
    save(next)
    return true
  },

  async reset() {
    save(DEFAULT_TREE)
    return DEFAULT_TREE
  },

  // helper for Arborist: flatten not needed, it consumes nested children
  async getNodeById(id) {
    const root = ensure()
    return findById(root, id)
  },
}
