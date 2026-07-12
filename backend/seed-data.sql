-- ========================================
-- SEED DATA สำหรับทดสอบ PrimePC
-- ========================================

-- 1. เคลียร์ข้อมูลเก่า (ถ้ามี)
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE carts CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- 2. สร้าง Admin User
INSERT INTO users (email, password, name, phone, address, role, "createdAt", "updatedAt")
VALUES
  ('admin@primepc.com', '$2b$10$rZ7YqE8vJx5VZl3K9.Z.uOYqX3K8Z3.3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z', 'Admin PrimePC', '0912345678', '123 Admin St., Bangkok', 'ADMIN', NOW(), NOW()),
  ('staff@primepc.com', '$2b$10$rZ7YqE8vJx5VZl3K9.Z.uOYqX3K8Z3.3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z', 'Staff PrimePC', '0923456789', '456 Staff Rd., Bangkok', 'STAFF', NOW(), NOW());

-- 3. สร้าง Products (20 รายการ)
INSERT INTO products (name, description, price, stock, "imageUrl", category, brand, "isAvailable", "createdAt", "updatedAt")
VALUES
  -- CPU (4 รายการ)
  ('Intel Core i9-14900K', 'Flagship Gaming Processor 24-Core', 21900, 15, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086', 'CPU', 'Intel', true, NOW(), NOW()),
  ('AMD Ryzen 9 7950X', 'High-Performance 16-Core Processor', 19900, 20, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', 'CPU', 'AMD', true, NOW(), NOW()),
  ('Intel Core i7-14700K', 'Performance Gaming CPU', 16900, 25, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c', 'CPU', 'Intel', true, NOW(), NOW()),
  ('AMD Ryzen 7 7800X3D', 'Gaming CPU with 3D V-Cache', 14900, 18, 'https://images.unsplash.com/photo-1591488320449-011701bb6704', 'CPU', 'AMD', true, NOW(), NOW()),

  -- GPU (4 รายการ)
  ('NVIDIA RTX 4090', 'Ultimate Gaming Graphics Card 24GB', 65900, 8, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7', 'GPU', 'NVIDIA', true, NOW(), NOW()),
  ('AMD RX 7900 XTX', 'High-End Gaming GPU 24GB', 39900, 12, 'https://images.unsplash.com/photo-1591488320449-011701bb6704', 'GPU', 'AMD', true, NOW(), NOW()),
  ('NVIDIA RTX 4070 Ti', 'Performance Gaming GPU 12GB', 32900, 15, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c', 'GPU', 'NVIDIA', true, NOW(), NOW()),
  ('AMD RX 7800 XT', 'Mid-Range Gaming GPU 16GB', 21900, 20, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', 'GPU', 'AMD', true, NOW(), NOW()),

  -- RAM (4 รายการ)
  ('Corsair Vengeance RGB 32GB', 'DDR5-6000 CL36 (2x16GB)', 5990, 30, 'https://images.unsplash.com/photo-1562976540-1502c2145186', 'RAM', 'Corsair', true, NOW(), NOW()),
  ('G.SKILL Trident Z5 64GB', 'DDR5-6400 CL32 (2x32GB)', 11900, 15, 'https://images.unsplash.com/photo-1541872703-74c5e44368f9', 'RAM', 'G.SKILL', true, NOW(), NOW()),
  ('Kingston Fury Beast 32GB', 'DDR5-5600 CL40 (2x16GB)', 4590, 40, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', 'RAM', 'Kingston', true, NOW(), NOW()),
  ('Corsair Dominator 64GB', 'DDR5-6200 CL36 (2x32GB)', 13900, 10, 'https://images.unsplash.com/photo-1562976540-1502c2145186', 'RAM', 'Corsair', true, NOW(), NOW()),

  -- Motherboard (4 รายการ)
  ('ASUS ROG Maximus Z790', 'ATX Gaming Motherboard Intel Z790', 15900, 12, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', 'Motherboard', 'ASUS', true, NOW(), NOW()),
  ('MSI MAG B650 Tomahawk', 'ATX AMD B650 Motherboard', 8990, 20, 'https://images.unsplash.com/photo-1562976540-1502c2145186', 'Motherboard', 'MSI', true, NOW(), NOW()),
  ('Gigabyte X670E Aorus Master', 'E-ATX AMD X670E Flagship', 18900, 8, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086', 'Motherboard', 'Gigabyte', true, NOW(), NOW()),
  ('ASUS TUF Gaming Z790', 'ATX Intel Z790 Durable Build', 9990, 18, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', 'Motherboard', 'ASUS', true, NOW(), NOW()),

  -- Storage (4 รายการ)
  ('Samsung 990 Pro 2TB', 'NVMe Gen4 SSD 7450MB/s', 6990, 25, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', 'Storage', 'Samsung', true, NOW(), NOW()),
  ('WD Black SN850X 1TB', 'NVMe Gen4 Gaming SSD 7300MB/s', 3990, 30, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58', 'Storage', 'Western Digital', true, NOW(), NOW()),
  ('Crucial P5 Plus 2TB', 'NVMe Gen4 SSD 6600MB/s', 5490, 22, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', 'Storage', 'Crucial', true, NOW(), NOW()),
  ('Kingston KC3000 1TB', 'NVMe Gen4 Performance SSD', 3590, 35, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58', 'Storage', 'Kingston', true, NOW(), NOW());

-- 4. แสดงผลลัพธ์
SELECT 'users' as table_name, COUNT(*) as total FROM users
UNION ALL
SELECT 'products' as table_name, COUNT(*) as total FROM products;

SELECT 'Created products by category:' as summary;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;
