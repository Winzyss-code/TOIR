// =============================================
// TOIR SYSTEM API ROUTES
// =============================================

import express from 'express'

export function setupRoutes(app, pool, verifyToken, checkRole) {

// ==================== SPARE PARTS ====================

// Получить все запасные части
app.get('/api/spare-parts', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM spare_parts WHERE is_active = true ORDER BY code')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка получения запасных частей' })
  }
})

// Получить одну запасную часть
app.get('/api/spare-parts/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM spare_parts WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Не найдена' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить запасную часть
app.post('/api/spare-parts', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, description, manufacturer, unit_of_measure, unit_price, supplier, category } = req.body
    const result = await pool.query(
      `INSERT INTO spare_parts (code, name, description, manufacturer, unit_of_measure, unit_price, supplier, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, name, description, manufacturer, unit_of_measure, unit_price, supplier, category]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Обновить запасную часть
app.put('/api/spare-parts/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, description, manufacturer, unit_of_measure, unit_price, supplier, category } = req.body
    const result = await pool.query(
      `UPDATE spare_parts SET code=$1, name=$2, description=$3, manufacturer=$4, unit_of_measure=$5, unit_price=$6, supplier=$7, category=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [code, name, description, manufacturer, unit_of_measure, unit_price, supplier, category, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Запасная часть не найдена' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Удалить запасную часть
app.delete('/api/spare-parts/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM spare_parts WHERE id=$1 RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Запасная часть не найдена' })
    res.json({ message: 'Запасная часть удалена' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== MATERIALS ====================

// Получить все материалы
app.get('/api/materials', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials WHERE is_active = true ORDER BY code')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка получения материалов' })
  }
})

// Добавить материал
app.post('/api/materials', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, description, unit_of_measure, unit_price, supplier, category } = req.body
    const result = await pool.query(
      `INSERT INTO materials (code, name, description, unit_of_measure, unit_price, supplier, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code, name, description, unit_of_measure, unit_price, supplier, category]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Обновить материал
app.put('/api/materials/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, description, unit_of_measure, unit_price, supplier, category } = req.body
    const result = await pool.query(
      `UPDATE materials SET code=$1, name=$2, description=$3, unit_of_measure=$4, unit_price=$5, supplier=$6, category=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [code, name, description, unit_of_measure, unit_price, supplier, category, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Материал не найден' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Удалить материал
app.delete('/api/materials/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM materials WHERE id=$1 RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Материал не найден' })
    res.json({ message: 'Материал удален' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== MAINTENANCE TYPES ====================

// Получить все типы ТО
app.get('/api/maintenance-types', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_types WHERE is_active = true ORDER BY code')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить тип ТО
app.post('/api/maintenance-types', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, frequency_type, frequency_value, description } = req.body
    const result = await pool.query(
      `INSERT INTO maintenance_types (code, name, frequency_type, frequency_value, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, name, frequency_type, frequency_value, description]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Обновить тип ТО
app.put('/api/maintenance-types/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, frequency_type, frequency_value, description } = req.body
    const result = await pool.query(
      `UPDATE maintenance_types SET code=$1, name=$2, frequency_type=$3, frequency_value=$4, description=$5
       WHERE id=$6 RETURNING *`,
      [code, name, frequency_type, frequency_value, description, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Тип не найден' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Удалить тип ТО
app.delete('/api/maintenance-types/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM maintenance_types WHERE id=$1 RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Тип не найден' })
    res.json({ message: 'Тип удален' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== MAINTENANCE PLANS ====================

// Получить все планы ТО
app.get('/api/maintenance-plans', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_plans ORDER BY next_due_date DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('Error in GET /api/maintenance-plans:', err.message)
    res.status(500).json({ error: 'Failed to load maintenance plans: ' + err.message })
  }
})

// Получить планы ТО по оборудованию
app.get('/api/maintenance-plans/equipment/:equipmentId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mp.*, mt.code, mt.name, mt.frequency_type, mt.frequency_value
      FROM maintenance_plans mp
      JOIN maintenance_types mt ON mp.maintenance_type_id = mt.id
      WHERE mp.equipment_node_id = $1 AND mp.is_active = true
      ORDER BY mp.next_due_date
    `, [req.params.equipmentId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить план ТО
app.post('/api/maintenance-plans', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { equipment_node_id, maintenance_type_id, description, next_due_date } = req.body
    const result = await pool.query(
      `INSERT INTO maintenance_plans (equipment_node_id, maintenance_type_id, description, next_due_date, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [equipment_node_id, maintenance_type_id, description, next_due_date, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Обновить план ТО
app.put('/api/maintenance-plans/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { equipment_node_id, maintenance_type_id, description, next_due_date, is_active } = req.body
    const result = await pool.query(
      `UPDATE maintenance_plans SET equipment_node_id=$1, maintenance_type_id=$2, description=$3, next_due_date=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [equipment_node_id, maintenance_type_id, description, next_due_date, is_active !== false, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'План не найден' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Удалить план ТО
app.delete('/api/maintenance-plans/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM maintenance_plans WHERE id=$1 RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'План не найден' })
    res.json({ message: 'План удален' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== MAINTENANCE HISTORY ====================

// Получить историю ТО
app.get('/api/maintenance-history', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mh.*, en.name as equipment_name, mt.name as maint_type_name, u.full_name
      FROM maintenance_history mh
      JOIN equipment_nodes en ON mh.equipment_node_id = en.id
      JOIN maintenance_types mt ON mh.maintenance_type_id = mt.id
      LEFT JOIN users u ON mh.performed_by = u.id
      ORDER BY mh.performed_date DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Получить историю ТО по оборудованию
app.get('/api/maintenance-history/equipment/:equipmentId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mh.*, mt.name as maint_type_name, u.full_name
      FROM maintenance_history mh
      JOIN maintenance_types mt ON mh.maintenance_type_id = mt.id
      LEFT JOIN users u ON mh.performed_by = u.id
      WHERE mh.equipment_node_id = $1
      ORDER BY mh.performed_date DESC
    `, [req.params.equipmentId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить запись в историю ТО
app.post('/api/maintenance-history', verifyToken, checkRole('admin', 'manager', 'technician'), async (req, res) => {
  try {
    const { equipment_node_id, maintenance_type_id, work_order_id, status, notes, runtime_at_service } = req.body
    const result = await pool.query(
      `INSERT INTO maintenance_history (equipment_node_id, maintenance_type_id, work_order_id, performed_date, performed_by, status, notes, runtime_at_service)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7) RETURNING *`,
      [equipment_node_id, maintenance_type_id, work_order_id, req.user.id, status, notes, runtime_at_service]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== EQUIPMENT RUNTIME ====================

// Получить наработку оборудования
app.get('/api/equipment-runtime/:equipmentId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT er.*, u.full_name
      FROM equipment_runtime er
      LEFT JOIN users u ON er.recorded_by = u.id
      WHERE er.equipment_node_id = $1
      ORDER BY er.recorded_date DESC
      LIMIT 50
    `, [req.params.equipmentId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить запись наработки
app.post('/api/equipment-runtime', verifyToken, async (req, res) => {
  try {
    const { equipment_node_id, runtime_hours, mileage_km, engine_hours, notes } = req.body
    const result = await pool.query(
      `INSERT INTO equipment_runtime (equipment_node_id, recorded_date, runtime_hours, mileage_km, engine_hours, recorded_by, notes)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6) RETURNING *`,
      [equipment_node_id, runtime_hours, mileage_km, engine_hours, req.user.id, notes]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== WORK ORDER OPERATIONS ====================

// Получить операции наряда
app.get('/api/work-order-operations/:workOrderId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wo.*, u.full_name
      FROM work_order_operations wo
      LEFT JOIN users u ON wo.assigned_to = u.id
      WHERE wo.work_order_id = $1
      ORDER BY wo.operation_number
    `, [req.params.workOrderId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить операцию наряда
app.post('/api/work-order-operations', verifyToken, checkRole('admin', 'manager', 'technician'), async (req, res) => {
  try {
    const { work_order_id, operation_number, description, estimated_hours, assigned_to, notes } = req.body
    const result = await pool.query(
      `INSERT INTO work_order_operations (work_order_id, operation_number, description, estimated_hours, assigned_to, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [work_order_id, operation_number, description, estimated_hours, assigned_to, notes]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Обновить операцию наряда
app.put('/api/work-order-operations/:id', verifyToken, checkRole('admin', 'manager', 'technician'), async (req, res) => {
  try {
    const { status, actual_hours, start_time, end_time } = req.body
    const result = await pool.query(
      `UPDATE work_order_operations SET status = $1, actual_hours = $2, start_time = $3, end_time = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [status, actual_hours, start_time, end_time, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Не найдена' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== SPARE PART USAGE ====================

// Получить выданные запасные части по наряду
app.get('/api/spare-part-usage/:workOrderId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT spu.*, sp.code, sp.name, sp.unit_of_measure, u.full_name
      FROM spare_part_usage spu
      JOIN spare_parts sp ON spu.spare_part_id = sp.id
      LEFT JOIN users u ON spu.issued_by = u.id
      WHERE spu.work_order_id = $1
      ORDER BY spu.issued_date DESC
    `, [req.params.workOrderId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить выданную запасную часть
app.post('/api/spare-part-usage', verifyToken, checkRole('admin', 'manager', 'technician'), async (req, res) => {
  try {
    const { work_order_id, spare_part_id, quantity_used, unit_price, notes } = req.body
    
    // Обновить остаток
    await pool.query(
      `UPDATE spare_parts_stock SET quantity_reserved = quantity_reserved + $1 WHERE spare_part_id = $2`,
      [quantity_used, spare_part_id]
    )
    
    const result = await pool.query(
      `INSERT INTO spare_part_usage (work_order_id, spare_part_id, quantity_used, unit_price, issued_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [work_order_id, spare_part_id, quantity_used, unit_price, req.user.id, notes]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ==================== MATERIAL USAGE ====================

// Получить выданные материалы по наряду
app.get('/api/material-usage/:workOrderId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mu.*, m.code, m.name, m.unit_of_measure, u.full_name
      FROM material_usage mu
      JOIN materials m ON mu.material_id = m.id
      LEFT JOIN users u ON mu.issued_by = u.id
      WHERE mu.work_order_id = $1
      ORDER BY mu.issued_date DESC
    `, [req.params.workOrderId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Добавить выданный материал
app.post('/api/material-usage', verifyToken, checkRole('admin', 'manager', 'technician'), async (req, res) => {
  try {
    const { work_order_id, material_id, quantity_used, unit_price, notes } = req.body
    const result = await pool.query(
      `INSERT INTO material_usage (work_order_id, material_id, quantity_used, unit_price, issued_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [work_order_id, material_id, quantity_used, unit_price, req.user.id, notes]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== SPARE PARTS STOCK ====================

// Получить остаток запасных частей
app.get('/api/spare-parts-stock', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sps.*, sp.code, sp.name, sp.unit_price
      FROM spare_parts_stock sps
      JOIN spare_parts sp ON sps.spare_part_id = sp.id
      ORDER BY sp.code
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Обновить остаток
app.put('/api/spare-parts-stock/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { quantity_on_hand } = req.body
    const result = await pool.query(
      `UPDATE spare_parts_stock SET quantity_on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [quantity_on_hand, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Не найдено' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== WORK TYPES ====================

// Получить все типы работ
app.get('/api/work-types', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM work_types WHERE is_active = true ORDER BY code')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== EQUIPMENT ====================

// Получить все оборудование
app.get('/api/equipment', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_nodes WHERE node_type = $1 ORDER BY name', ['asset'])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

}

export default setupRoutes
