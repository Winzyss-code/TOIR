-- =============================================
-- TOIR System Database Schema (PostgreSQL)
-- =============================================

-- Полная очистка схемы
DROP TABLE IF EXISTS spare_part_usage CASCADE;
DROP TABLE IF EXISTS material_usage CASCADE;
DROP TABLE IF EXISTS work_order_operations CASCADE;
DROP TABLE IF EXISTS maintenance_history CASCADE;
DROP TABLE IF EXISTS equipment_runtime CASCADE;
DROP TABLE IF EXISTS spare_parts_stock CASCADE;
DROP TABLE IF EXISTS spare_parts CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS work_types CASCADE;
DROP TABLE IF EXISTS maintenance_types CASCADE;
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
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    qualification VARCHAR(50),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =============================================
-- 2. ДЕРЕВО ОБОРУДОВАНИЯ
-- =============================================
CREATE TABLE equipment_nodes (
    id VARCHAR(50) PRIMARY KEY,
    parent_id VARCHAR(50) REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    node_type VARCHAR(20) NOT NULL,
    code VARCHAR(50),
    inv VARCHAR(50),
    serial VARCHAR(100),
    location VARCHAR(100),
    category VARCHAR(50),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    installed_date DATE,
    commissioning_date DATE,
    current_runtime_hours DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_parent ON equipment_nodes(parent_id);
CREATE INDEX idx_equipment_type ON equipment_nodes(node_type);
CREATE INDEX idx_equipment_status ON equipment_nodes(status);
CREATE INDEX idx_equipment_category ON equipment_nodes(category);

-- =============================================
-- 3. СПРАВОЧНИК ТИПОВ РАБОТ
-- =============================================
CREATE TABLE work_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. СПРАВОЧНИК ТИПОВ ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ
-- =============================================
CREATE TABLE maintenance_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    frequency_type VARCHAR(20) NOT NULL,
    frequency_value INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. СПРАВОЧНИК ЗАПАСНЫХ ЧАСТЕЙ
-- =============================================
CREATE TABLE spare_parts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(100),
    unit_of_measure VARCHAR(20) DEFAULT 'шт',
    unit_price DECIMAL(12,2),
    supplier VARCHAR(150),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spare_parts_code ON spare_parts(code);
CREATE INDEX idx_spare_parts_category ON spare_parts(category);

-- =============================================
-- 6. ОСТАТОК ЗАПАСНЫХ ЧАСТЕЙ НА СКЛАДЕ
-- =============================================
CREATE TABLE spare_parts_stock (
    id SERIAL PRIMARY KEY,
    spare_part_id INT NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
    warehouse_location VARCHAR(100),
    quantity_on_hand INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,
    quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_level INT DEFAULT 5,
    last_count_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_spare_part ON spare_parts_stock(spare_part_id);

-- =============================================
-- 7. СПРАВОЧНИК МАТЕРИАЛОВ
-- =============================================
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) DEFAULT 'л',
    unit_price DECIMAL(12,2),
    supplier VARCHAR(150),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_category ON materials(category);

-- =============================================
-- 8. ЗАЯВКИ НА РАБОТЫ (Наряд-задание)
-- =============================================
CREATE TABLE work_orders (
    id VARCHAR(50) PRIMARY KEY,
    number VARCHAR(30) UNIQUE,
    equipment_node_id VARCHAR(50) REFERENCES equipment_nodes(id) ON DELETE SET NULL,
    work_type_id INT REFERENCES work_types(id) ON DELETE SET NULL,
    location VARCHAR(100),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    description TEXT,
    detailed_description TEXT,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    planned_start_date TIMESTAMP,
    planned_end_date TIMESTAMP,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2)
);

CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_type ON work_orders(work_type_id);
CREATE INDEX idx_work_orders_equipment ON work_orders(equipment_node_id);
CREATE INDEX idx_work_orders_assigned ON work_orders(assigned_to);
CREATE INDEX idx_work_orders_created ON work_orders(created_at DESC);

-- =============================================
-- 9. ОПЕРАЦИИ НАРЯДА-ЗАДАНИЯ
-- =============================================
CREATE TABLE work_order_operations (
    id SERIAL PRIMARY KEY,
    work_order_id VARCHAR(50) NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    operation_number INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operations_work_order ON work_order_operations(work_order_id);
CREATE INDEX idx_operations_assigned ON work_order_operations(assigned_to);

-- =============================================
-- 10. ВЫДАННЫЕ ЗАПАСНЫЕ ЧАСТИ
-- =============================================
CREATE TABLE spare_part_usage (
    id SERIAL PRIMARY KEY,
    work_order_id VARCHAR(50) NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    spare_part_id INT NOT NULL REFERENCES spare_parts(id) ON DELETE RESTRICT,
    quantity_used INT NOT NULL,
    unit_price DECIMAL(12,2),
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity_used * unit_price) STORED,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spare_usage_work_order ON spare_part_usage(work_order_id);
CREATE INDEX idx_spare_usage_part ON spare_part_usage(spare_part_id);

-- =============================================
-- 11. ВЫДАННЫЕ МАТЕРИАЛЫ
-- =============================================
CREATE TABLE material_usage (
    id SERIAL PRIMARY KEY,
    work_order_id VARCHAR(50) NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    material_id INT NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    quantity_used DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,2),
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity_used * unit_price) STORED,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_usage_work_order ON material_usage(work_order_id);
CREATE INDEX idx_material_usage_material ON material_usage(material_id);

-- =============================================
-- 12. ПЛАНЫ ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ
-- =============================================
CREATE TABLE maintenance_plans (
    id SERIAL PRIMARY KEY,
    equipment_node_id VARCHAR(50) NOT NULL REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    maintenance_type_id INT NOT NULL REFERENCES maintenance_types(id) ON DELETE RESTRICT,
    description TEXT,
    last_performed_date TIMESTAMP,
    next_due_date TIMESTAMP,
    next_due_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_plans_equipment ON maintenance_plans(equipment_node_id);
CREATE INDEX idx_maintenance_plans_active ON maintenance_plans(is_active);
CREATE INDEX idx_maintenance_plans_due ON maintenance_plans(next_due_date);

-- =============================================
-- 13. ИСТОРИЯ ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ
-- =============================================
CREATE TABLE maintenance_history (
    id SERIAL PRIMARY KEY,
    equipment_node_id VARCHAR(50) NOT NULL REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    maintenance_type_id INT NOT NULL REFERENCES maintenance_types(id) ON DELETE RESTRICT,
    work_order_id VARCHAR(50) REFERENCES work_orders(id) ON DELETE SET NULL,
    performed_date TIMESTAMP NOT NULL,
    performed_by INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    runtime_at_service DECIMAL(10,2),
    mileage_at_service DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maint_history_equipment ON maintenance_history(equipment_node_id);
CREATE INDEX idx_maint_history_date ON maintenance_history(performed_date DESC);
CREATE INDEX idx_maint_history_work_order ON maintenance_history(work_order_id);

-- =============================================
-- 14. НАРАБОТКА ОБОРУДОВАНИЯ
-- =============================================
CREATE TABLE equipment_runtime (
    id SERIAL PRIMARY KEY,
    equipment_node_id VARCHAR(50) NOT NULL REFERENCES equipment_nodes(id) ON DELETE CASCADE,
    recorded_date TIMESTAMP NOT NULL,
    runtime_hours DECIMAL(10,2),
    mileage_km DECIMAL(10,2),
    engine_hours DECIMAL(10,2),
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_runtime_equipment ON equipment_runtime(equipment_node_id);
CREATE INDEX idx_runtime_date ON equipment_runtime(recorded_date DESC);

-- =============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =============================================

-- Пользователи
INSERT INTO users (username, password_hash, full_name, role, qualification, department, is_active) VALUES
('admin', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Администратор', 'admin', 'Инженер', 'Администрация', true),
('manager', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Руководитель ТО', 'manager', 'Мастер', 'ТО', true),
('tech1', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Иванов Иван', 'technician', 'Слесарь-ремонтник I категория', 'ТО', true),
('tech2', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Петров Петр', 'technician', 'Слесарь-ремонтник II категория', 'ТО', true),
('op1', '$2b$10$rQZ8K1X5X5X5X5X5X5X5XOexamplehash', 'Сидоров Сергей', 'operator', 'Оператор', 'Производство', true);

-- Дерево оборудования
INSERT INTO equipment_nodes (id, parent_id, name, node_type, sort_order) VALUES
('root', NULL, 'Структура основная', 'folder', 0);

INSERT INTO equipment_nodes (id, parent_id, name, node_type, sort_order) VALUES
('cat-pumps', 'root', 'Насосы', 'folder', 1),
('cat-compressors', 'root', 'Компрессоры', 'folder', 2),
('cat-generators', 'root', 'Генераторы', 'folder', 3),
('cat-motors', 'root', 'Электродвигатели', 'folder', 4),
('cat-lines', 'root', 'Производственные линии', 'folder', 5);

INSERT INTO equipment_nodes (id, parent_id, name, node_type, code, inv, serial, location, category, manufacturer, model, installed_date, current_runtime_hours, status, sort_order) VALUES
('pump-001', 'cat-pumps', 'Насос циркуляционный П-100', 'asset', 'P-100', 'INV-1001', 'SN-88421', 'Цех №1', 'Насосы', 'Grundfos', 'CR 15-12', '2020-05-15', 8450.5, 'active', 1),
('pump-002', 'cat-pumps', 'Насос подкачки П-50', 'asset', 'P-50', 'INV-1002', 'SN-88422', 'Цех №2', 'Насосы', 'Grundfos', 'CR 10-8', '2019-03-20', 12300.25, 'active', 2),
('comp-001', 'cat-compressors', 'Компрессор винтовой К-15', 'asset', 'K-15', 'INV-2001', 'SN-77221', 'Цех №1', 'Компрессоры', 'Atlas Copco', 'GA15', '2021-01-10', 5630.0, 'active', 1),
('gen-001', 'cat-generators', 'Генератор дизельный Г-100', 'asset', 'G-100', 'INV-3001', 'SN-66331', 'Склад', 'Генераторы', 'Caterpillar', 'C15', '2018-11-05', 24500.75, 'inactive', 1),
('motor-001', 'cat-motors', 'Электродвигатель М-15кВт', 'asset', 'M-15', 'INV-4001', 'SN-55441', 'Цех №2', 'Электродвигатели', 'Siemens', '1LE1 90s', '2020-08-12', 7200.0, 'active', 1),
('line-a1', 'cat-lines', 'Линия сборки А1', 'asset', 'L-A1', 'INV-5001', 'SN-44551', 'Цех №3', 'Производственные линии', 'Bosch', 'KKS-2000', '2019-06-01', 18900.5, 'active', 1);

-- Типы работ
INSERT INTO work_types (code, name, description, is_active) VALUES
('TO-1', 'ТО-1', 'Техническое обслуживание первого вида', true),
('TO-2', 'ТО-2', 'Техническое обслуживание второго вида', true),
('TO-3', 'ТО-3', 'Техническое обслуживание третьего вида', true),
('EMERGENCY', 'Аварийный ремонт', 'Неплановый ремонт при отказе', true),
('PLANNED', 'Плановый ремонт', 'Запланированный текущий ремонт', true),
('PREVENTIVE', 'Профилактика', 'Профилактическое обслуживание', true);

-- Типы ТО
INSERT INTO maintenance_types (code, name, frequency_type, frequency_value, description, is_active) VALUES
('DAILY', 'Ежедневное ТО', 'days', 1, 'Ежедневный осмотр и смазка', true),
('WEEKLY', 'Еженедельное ТО', 'days', 7, 'Еженедельная проверка всех узлов', true),
('MONTHLY', 'Ежемесячное ТО', 'months', 1, 'Ежемесячное техническое обслуживание', true),
('QUARTERLY', 'Квартальное ТО', 'months', 3, 'ТО-1 каждые 3 месяца', true),
('SEASONAL', 'Сезонное ТО', 'months', 6, 'ТО-2 каждые 6 месяцев', true),
('ANNUAL', 'Годовое ТО', 'months', 12, 'ТО-3 ежегодное обслуживание', true);

-- Запасные части
INSERT INTO spare_parts (code, name, description, manufacturer, unit_of_measure, unit_price, supplier, category, is_active) VALUES
('SP-001', 'Масло трансмиссионное ISO VG 46', 'Масло для редукторов и гидросистем', 'Shell', 'л', 250.00, 'ООО Нефтеснаб', 'Масла', true),
('SP-002', 'Подшипник 6308-2Z', 'Подшипник шариковый', 'SKF', 'шт', 1500.00, 'ООО Подшипники', 'Подшипники', true),
('SP-003', 'Ремень клиновой B140', 'Ремень B140 для привода насоса', 'Contitech', 'шт', 800.00, 'ООО МехПро', 'Ремни', true),
('SP-004', 'Уплотнение резиновое Ø80', 'Прокладка резиновая Ø80 мм', 'Parker', 'шт', 120.00, 'ООО СантехПро', 'Уплотнения', true),
('SP-005', 'Фильтр воздушный', 'Воздушный фильтр компрессора', 'Donaldson', 'шт', 2500.00, 'ООО ФильтрСервис', 'Фильтры', true),
('SP-006', 'Гидравлическое масло ISO VG 32', 'Масло гидравлическое', 'Mobil', 'л', 180.00, 'ООО Нефтеснаб', 'Масла', true),
('SP-007', 'Фильтр масляный', 'Масляный фильтр насоса', 'Hydac', 'шт', 3200.00, 'ООО ФильтрСервис', 'Фильтры', true),
('SP-008', 'Манжета уплотнительная', 'Манжета для вала насоса', 'Freudenberg', 'шт', 600.00, 'ООО СантехПро', 'Уплотнения', true);

-- Материалы
INSERT INTO materials (code, name, description, unit_of_measure, unit_price, supplier, category, is_active) VALUES
('MAT-001', 'Дизельное топливо', 'Топливо для генератора', 'л', 55.00, 'АЗС №5', 'Топливо', true),
('MAT-002', 'Краска синтетическая', 'Краска для защиты металла', 'л', 450.00, 'ООО КрасотеХ', 'Краски', true),
('MAT-003', 'Обезжириватель', 'Для очистки узлов перед ТО', 'л', 180.00, 'ООО ХимПро', 'Химия', true),
('MAT-004', 'Литол-24', 'Универсальная смазка', 'кг', 250.00, 'ООО СмазТеХ', 'Смазки', true);

-- Остаток запасных частей
INSERT INTO spare_parts_stock (spare_part_id, warehouse_location, quantity_on_hand, quantity_reserved, reorder_level) VALUES
(1, 'Склад №1', 50, 5, 10),
(2, 'Склад №1', 8, 1, 3),
(3, 'Склад №2', 15, 2, 5),
(4, 'Склад №1', 20, 3, 5),
(5, 'Склад №2', 12, 1, 3),
(6, 'Склад №1', 30, 0, 10),
(7, 'Склад №2', 5, 2, 2),
(8, 'Склад №1', 25, 4, 8);

-- Планы ТО
INSERT INTO maintenance_plans (equipment_node_id, maintenance_type_id, description, last_performed_date, next_due_date, is_active, created_by) VALUES
('pump-001', 2, 'Еженедельная проверка и смазка насоса', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', true, 2),
('pump-001', 3, 'Ежемесячная замена масла и фильтров', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP + INTERVAL '30 days', true, 2),
('pump-002', 2, 'Еженедельный осмотр насоса', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 days', true, 2),
('comp-001', 3, 'Ежемесячное ТО компрессора', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '15 days', true, 2);

-- Заявки
INSERT INTO work_orders (id, number, equipment_node_id, work_type_id, location, priority, status, description, assigned_to, created_by, created_at) VALUES
('wo-001', 'НЗ-001', 'pump-001', 4, 'Цех №1', 'high', 'open', 'Замена подшипника насоса', 3, 2, CURRENT_TIMESTAMP - INTERVAL '2 days'),
('wo-002', 'НЗ-002', 'comp-001', 1, 'Цех №1', 'medium', 'in_progress', 'Плановое ТО компрессора', 3, 2, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('wo-003', 'НЗ-003', 'pump-002', 5, 'Цех №2', 'medium', 'completed', 'Проверка герметичности', 4, 2, CURRENT_TIMESTAMP - INTERVAL '5 days');

-- Выданные запасные части
INSERT INTO spare_part_usage (work_order_id, spare_part_id, quantity_used, unit_price, issued_date, issued_by) VALUES
('wo-002', 2, 1, 1500.00, CURRENT_TIMESTAMP - INTERVAL '1 day', 3),
('wo-003', 3, 2, 800.00, CURRENT_TIMESTAMP - INTERVAL '5 days', 4);

-- История ТО
INSERT INTO maintenance_history (equipment_node_id, maintenance_type_id, work_order_id, performed_date, performed_by, status, runtime_at_service) VALUES
('pump-001', 2, 'wo-003', CURRENT_TIMESTAMP - INTERVAL '5 days', 4, 'completed', 8440.5),
('pump-001', 3, NULL, CURRENT_TIMESTAMP - INTERVAL '30 days', 2, 'completed', 8410.0),
('comp-001', 3, NULL, CURRENT_TIMESTAMP - INTERVAL '15 days', 3, 'completed', 5615.0);

-- Наработка оборудования
INSERT INTO equipment_runtime (equipment_node_id, recorded_date, runtime_hours, recorded_by) VALUES
('pump-001', CURRENT_TIMESTAMP, 8450.5, 2),
('pump-002', CURRENT_TIMESTAMP, 12300.25, 2),
('comp-001', CURRENT_TIMESTAMP, 5630.0, 2),
('motor-001', CURRENT_TIMESTAMP, 7200.0, 2),
('line-a1', CURRENT_TIMESTAMP, 18900.5, 2);
