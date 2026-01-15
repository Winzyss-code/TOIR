import express from 'express'
import cors from 'cors'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import setupRoutes from './api-routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Database
const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to Neon PostgreSQL'))
  .catch(err => console.error('❌ DB error:', err.message))

// Middleware
app.use(cors())
app.use(express.json())

// JWT Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' })
  }
}

// Role Check Middleware
function checkRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' })
    }
    next()
  }
}

// ==================== AUTH ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' })
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Неверный логин или пароль' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, full_name, email } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' })
    }

    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, email) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role`,
      [username, password_hash, full_name || null, email || null]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ==================== WORK ORDERS ====================

app.get('/api/work-orders', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM work_orders ORDER BY created_at DESC'
    
    // Technician видит только свои заявки
    if (req.user.role === 'technician') {
      query = 'SELECT * FROM work_orders WHERE assigned_to = $1 ORDER BY created_at DESC'
      const result = await pool.query(query, [req.user.id])
      return res.json(result.rows)
    }
    
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/api/work-orders/stats/summary', verifyToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'done') as done,
        COUNT(*) FILTER (WHERE work_type = 'Emergency') as emergencies
      FROM work_orders`
    
    if (req.user.role === 'technician') {
      query += ' WHERE assigned_to = $1'
      const result = await pool.query(query, [req.user.id])
      return res.json(result.rows[0])
    }
    
    const result = await pool.query(query)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/api/work-orders/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM work_orders WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Заявка не найдена' })
    
    const order = result.rows[0]
    
    // Technician может видеть только свои заявки
    if (req.user.role === 'technician' && order.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещён' })
    }
    
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.post('/api/work-orders', verifyToken, checkRole('admin', 'technician'), async (req, res) => {
  try {
    const { equipment, location, work_type, priority, status, description, assigned_to } = req.body
    if (!equipment || !work_type || !priority) {
      return res.status(400).json({ error: 'Обязательные поля: equipment, work_type, priority' })
    }

    const id = `wo-${Date.now()}`
    const result = await pool.query(
      `INSERT INTO work_orders (id, equipment, location, work_type, priority, status, description, created_by, assigned_to) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, equipment, location || null, work_type, priority, status || 'open', description || null, req.user.id, assigned_to || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.put('/api/work-orders/:id', verifyToken, checkRole('admin', 'technician'), async (req, res) => {
  try {
    const { equipment, location, work_type, priority, status, description, assigned_to } = req.body
    
    // Проверяем право доступа
    const order = await pool.query('SELECT * FROM work_orders WHERE id = $1', [req.params.id])
    if (order.rows.length === 0) return res.status(404).json({ error: 'Заявка не найдена' })
    
    if (req.user.role === 'technician' && order.rows[0].assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Вы можете менять только свои заявки' })
    }
    
    const result = await pool.query(
      `UPDATE work_orders SET equipment = COALESCE($2, equipment), location = COALESCE($3, location), 
       work_type = COALESCE($4, work_type), priority = COALESCE($5, priority), status = COALESCE($6, status), 
       description = COALESCE($7, description), assigned_to = COALESCE($8, assigned_to), 
       updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id, equipment, location, work_type, priority, status, description, assigned_to]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.delete('/api/work-orders/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM work_orders WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Заявка не найдена' })
    res.json({ message: 'Заявка удалена', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ==================== EQUIPMENT ====================

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => n.parent_id === parentId)
    .map(node => ({
      id: node.id,
      name: node.name,
      type: node.node_type,
      code: node.code,
      inv: node.inv,
      serial: node.serial,
      location: node.location,
      children: buildTree(nodes, node.id)
    }))
}

app.get('/api/equipment/tree', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_nodes ORDER BY sort_order, name')
    const nodes = result.rows
    const root = nodes.find(n => n.id === 'root')

    if (!root) return res.json(null)

    res.json({
      id: root.id,
      name: root.name,
      type: root.node_type,
      children: buildTree(nodes, 'root')
    })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/api/equipment/nodes', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_nodes ORDER BY sort_order')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.post('/api/equipment/nodes', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { parent_id, name, node_type, code, inv, serial, location } = req.body
    if (!name || !node_type) {
      return res.status(400).json({ error: 'Обязательные поля: name, node_type' })
    }

    const id = `node-${Date.now()}`
    const result = await pool.query(
      `INSERT INTO equipment_nodes (id, parent_id, name, node_type, code, inv, serial, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, parent_id || 'root', name, node_type, code || null, inv || null, serial || null, location || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error creating equipment node:', err)
    res.status(500).json({ error: 'Ошибка сервера', details: err.message })
  }
})

app.patch('/api/equipment/nodes/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { name, code, inv, serial, location } = req.body
    const result = await pool.query(
      `UPDATE equipment_nodes SET name = COALESCE($2, name), code = COALESCE($3, code), inv = COALESCE($4, inv), serial = COALESCE($5, serial), location = COALESCE($6, location), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id, name, code, inv, serial, location]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Узел не найден' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.delete('/api/equipment/nodes/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    if (req.params.id === 'root') return res.status(400).json({ error: 'Нельзя удалить корневой узел' })
    const result = await pool.query('DELETE FROM equipment_nodes WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Узел не найден' })
    res.json({ message: 'Узел удалён', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.post('/api/equipment/reset', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM equipment_nodes')

    await pool.query(`
      INSERT INTO equipment_nodes (id, parent_id, name, node_type, sort_order) VALUES
      ('root', NULL, 'Структура основная', 'folder', 0),
      ('eq-ind', 'root', 'Оборудование общепромышленное', 'folder', 1),
      ('lines', 'eq-ind', 'Производственные линии', 'folder', 1)
    `)

    await pool.query(`
      INSERT INTO equipment_nodes (id, parent_id, name, node_type, code, inv, serial, location, sort_order) VALUES
      ('line1', 'lines', 'Линия сборки №1', 'asset', 'L-001', 'INV-1001', 'SN-88421', 'Цех №1', 1),
      ('gear', 'line1', 'Редуктор', 'asset', 'R-10', 'INV-204', 'SN-2211', 'Цех №1', 1),
      ('bearing', 'gear', 'Подшипник', 'asset', 'B-7', 'INV-777', 'SN-7777', 'Цех №1', 1)
    `)

    const result = await pool.query('SELECT * FROM equipment_nodes ORDER BY sort_order')
    const nodes = result.rows
    const root = nodes.find(n => n.id === 'root')

    const tree = {
      id: root.id,
      name: root.name,
      type: root.node_type,
      children: buildTree(nodes, 'root')
    }

    res.json(tree)
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ==================== MAINTENANCE PLANS ====================

// ==================== AUTO-GENERATE WORK ORDERS ====================

// Функция для создания заявок по графикам ТО (запускается например раз в час)
app.post('/api/maintenance-plans/auto-create-orders', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const now = new Date()
    
    // Ищем все планы ТО которые наступили или наступят в течение дня
    const result = await pool.query(`
      SELECT * FROM maintenance_plans 
      WHERE is_active = true 
      AND next_due_date <= $1
    `, [new Date(now.getTime() + 24 * 60 * 60 * 1000)])

    let createdOrders = 0
    
    for (const plan of result.rows) {
      // Проверяем есть ли уже открытая заявка для этого плана
      const existingOrder = await pool.query(`
        SELECT id FROM work_orders 
        WHERE equipment = $1 
        AND status IN ('open', 'in_progress')
        AND work_type = 'Planned'
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 day'
      `, [plan.equipment_name])
      
      if (existingOrder.rows.length === 0) {
        // Создаем новую заявку
        const id = `wo-${Date.now()}-${createdOrders}`
        await pool.query(`
          INSERT INTO work_orders 
          (id, equipment, equipment_node_id, work_type, priority, status, description, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, plan.equipment_name, plan.equipment_node_id, 'Planned', 'medium', 'open', 
            `Плановое обслуживание: ${plan.description || 'ТО'}`, req.user.id])
        
        createdOrders++
      }
    }
    
    res.json({ message: `Создано ${createdOrders} новых заявок`, count: createdOrders })
  } catch (err) {
    console.error('Error auto-creating orders:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Setup TOIR routes
setupRoutes(app, pool, verifyToken, checkRole)

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
