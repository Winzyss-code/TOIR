-- =============================================
-- CMMS Database Schema (PostgreSQL)
-- =============================================

-- Удаление таблиц если существуют
DROP TABLE IF EXISTS maintenance_plans CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS equipment_nodes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 1. ПОЛЬЗОВАТЕЛИ
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',  -- admin, user, technician
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по username
CREATE INDEX idx_users_username ON users(username);

-- =============================================
-- 2. ДЕРЕВО ОБОРУДОВАНИЯ
-- =============================================
CREATE TABLE equipment_nodes (
    id VARCHAR(50) PRIMARY KEY,
    parent_id VARCHAR(50) REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    node_type VARCHAR(20) NOT NULL,  -- folder, asset
    code VARCHAR(50),                 -- код оборудования
    inv VARCHAR(50),                  -- инвентарный номер
    serial VARCHAR(100),              -- серийный номер
    location VARCHAR(100),            -- местоположение
    sort_order INT DEFAULT 0,         -- порядок сортировки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_equipment_parent ON equipment_nodes(parent_id);
CREATE INDEX idx_equipment_type ON equipment_nodes(node_type);

-- =============================================
-- 3. ЗАЯВКИ НА РАБОТЫ
-- =============================================
CREATE TABLE work_orders (
    id VARCHAR(50) PRIMARY KEY,
    equipment VARCHAR(100) NOT NULL,
    equipment_node_id VARCHAR(50) REFERENCES equipment_nodes(id) ON DELETE SET NULL,
    location VARCHAR(100),
    work_type VARCHAR(20) NOT NULL,   -- Emergency, Planned
    priority VARCHAR(20) NOT NULL,     -- low, medium, high
    status VARCHAR(20) NOT NULL,       -- open, in_progress, done
    description TEXT,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Индексы
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_type ON work_orders(work_type);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_created ON work_orders(created_at DESC);

-- =============================================
-- 4. ПЛАНОВОЕ ОБСЛУЖИВАНИЕ (Preventive Maintenance)
-- =============================================
CREATE TABLE maintenance_plans (
    id SERIAL PRIMARY KEY,
    equipment_node_id VARCHAR(50) NOT NULL REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    equipment_name VARCHAR(100),
    frequency_type VARCHAR(20) NOT NULL,   -- 'hours', 'days', 'weeks', 'months'
    frequency_value INT NOT NULL,           -- каждые N часов/дней/недель/месяцев
    description TEXT,                       -- что нужно делать при ТО
    last_maintenance_date TIMESTAMP,        -- когда в последний раз делали
    next_due_date TIMESTAMP,                -- когда нужно будет делать ТО
    is_active BOOLEAN DEFAULT true,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_maintenance_plans_equipment ON maintenance_plans(equipment_node_id);
CREATE INDEX idx_maintenance_plans_active ON maintenance_plans(is_active);
CREATE INDEX idx_maintenance_plans_due ON maintenance_plans(next_due_date);

-- =============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =============================================

-- Админ пользователь (пароль: admin123)
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Администратор', 'admin'),
('technician', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Техник Иванов', 'technician');

-- Корневой узел дерева оборудования
INSERT INTO equipment_nodes (id, parent_id, name, node_type, sort_order) VALUES
('root', NULL, 'Структура основная', 'folder', 0);

-- Папки и оборудование
INSERT INTO equipment_nodes (id, parent_id, name, node_type, sort_order) VALUES
('eq-ind', 'root', 'Оборудование общепромышленное', 'folder', 1),
('lines', 'eq-ind', 'Производственные линии', 'folder', 1);

INSERT INTO equipment_nodes (id, parent_id, name, node_type, code, inv, serial, location, sort_order) VALUES
('line1', 'lines', 'Линия сборки №1', 'asset', 'L-001', 'INV-1001', 'SN-88421', 'Цех №1', 1),
('gear', 'line1', 'Редуктор', 'asset', 'R-10', 'INV-204', 'SN-2211', 'Цех №1', 1),
('bearing', 'gear', 'Подшипник', 'asset', 'B-7', 'INV-777', 'SN-7777', 'Цех №1', 1);

-- Демо графики ТО
INSERT INTO maintenance_plans (equipment_node_id, equipment_name, frequency_type, frequency_value, description, created_by, next_due_date) VALUES
('line1', 'Линия сборки №1', 'days', 7, 'Еженедельная проверка и смазка', 1, CURRENT_TIMESTAMP + INTERVAL '3 days'),
('line1', 'Линия сборки №1', 'months', 1, 'Ежемесячное техническое обслуживание', 1, CURRENT_TIMESTAMP + INTERVAL '20 days'),
('gear', 'Редуктор', 'weeks', 2, 'Проверка масла и уровня', 1, CURRENT_TIMESTAMP + INTERVAL '10 days');

-- Демо заявки
INSERT INTO work_orders (id, equipment, location, work_type, priority, status, created_at) VALUES
('wo-001', 'Насос P-100', 'Цех №1', 'Emergency', 'high', 'open', '2025-03-01'),
('wo-002', 'Компрессор C-20', 'Цех №2', 'Planned', 'medium', 'in_progress', '2025-03-02'),
('wo-003', 'Генератор G-5', 'Цех №3', 'Planned', 'low', 'done', '2025-02-25');

-- =============================================
-- ПОЛЕЗНЫЕ ЗАПРОСЫ
-- =============================================

-- Получить всех детей узла (рекурсивно)
-- WITH RECURSIVE tree AS (
--     SELECT * FROM equipment_nodes WHERE id = 'root'
--     UNION ALL
--     SELECT e.* FROM equipment_nodes e
--     JOIN tree t ON e.parent_id = t.id
-- )
-- SELECT * FROM tree;

-- Статистика по заявкам
-- SELECT 
--     COUNT(*) as total,
--     COUNT(*) FILTER (WHERE status = 'open') as open,
--     COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
--     COUNT(*) FILTER (WHERE status = 'done') as done,
--     COUNT(*) FILTER (WHERE work_type = 'Emergency') as emergencies
-- FROM work_orders;
