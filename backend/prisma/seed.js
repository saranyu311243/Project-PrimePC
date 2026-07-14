/**
 * PrimePC Database Seed
 * -------------------------------------------------------------
 * Creates test accounts (ADMIN / STAFF / CUSTOMER) with real bcrypt
 * password hashes and all 65 products that the frontend catalog uses.
 *
 * Product ids are pinned (1..65) so that cart/order validation on the
 * backend matches the ids the frontend sends.
 *
 * Run with:  npm run seed
 */
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

// Category id -> Thai display name (mirrors frontend data/categories.js)
const categoryNames = {
  cpu: 'ซีพียู',
  gpu: 'การ์ดจอ',
  motherboard: 'เมนบอร์ด',
  ram: 'แรม',
  storage: 'ฮาร์ดดิสก์ และ เอสเอสดี',
  monitor: 'จอมอนิเตอร์',
  psu: 'พาวเวอร์ซัพพลาย',
  cooling: 'ชุดระบายความร้อน',
  keyboard: 'คีย์บอร์ด',
  mouse: 'เมาส์',
  notebook: 'โน้ตบุ๊ก',
  accessory: 'อุปกรณ์เสริม',
  case: 'เคส',
  headset: 'หูฟัง',
};

// Ids that are shown as "out of stock" on the frontend
const outOfStockIds = new Set([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]);

const productCatalog = [
  { id: 1, name: 'AMD Ryzen 7 9700X', category: 'cpu', brand: 'AMD', price: 12900, icon: 'CPU', description: 'ซีพียู 8 คอร์ 16 เธรด สำหรับเกมและงานประสิทธิภาพสูง รองรับซ็อกเก็ต AM5' },
  { id: 2, name: 'Intel Core Ultra 7 265K', category: 'cpu', brand: 'Intel', price: 13900, icon: 'CPU', description: 'หน่วยประมวลผลรุ่นใหม่ ให้ประสิทธิภาพรวดเร็วสำหรับการทำงานหลายโปรแกรม' },
  { id: 3, name: 'GeForce RTX 5070 12GB', category: 'gpu', brand: 'ASUS', price: 24900, icon: 'GPU', description: 'การ์ดจอสำหรับเล่นเกมความละเอียดสูง พร้อมหน่วยความจำกราฟิก 12GB', specs: { gpuSeries: 'NVIDIA GeForce RTX 50 Series', gpuModel: 'GeForce RTX 5070' } },
  { id: 4, name: 'Radeon RX 9070 XT 16GB', category: 'gpu', brand: 'SAPPHIRE', price: 27900, icon: 'GPU', description: 'การ์ดจอประสิทธิภาพสูง หน่วยความจำ 16GB เหมาะสำหรับเกมและงานสร้างสรรค์', specs: { gpuSeries: 'AMD Radeon RX 9000 Series', gpuModel: 'Radeon RX 9070 XT' } },
  { id: 5, name: 'B650 Gaming WiFi AM5', category: 'motherboard', brand: 'ASUS', price: 7490, icon: 'MB', description: 'เมนบอร์ดเกมมิ่งรองรับ AMD AM5, DDR5 และการเชื่อมต่อ WiFi ความเร็วสูง', specs: { chipset: 'B650' } },
  { id: 6, name: 'DDR5 RGB 32GB 6000MHz', category: 'ram', brand: 'CORSAIR', price: 3890, icon: 'RAM', description: 'แรม DDR5 ความจุ 32GB พร้อมไฟ RGB ทำงานลื่นไหลและตอบสนองรวดเร็ว', specs: { memoryCapacity: '32GB (16GBx2)', memoryType: 'DDR5' } },
  { id: 7, name: 'LEXAR NM790 M.2 NVMe Gen4 1TB', category: 'storage', brand: 'LEXAR', price: 3590, icon: 'SSD', description: 'M.2 NVMe PCIe Gen4 ความจุ 1TB อ่านเขียนรวดเร็ว เหมาะสำหรับระบบปฏิบัติการ เกม และงานตัดต่อ' },
  { id: 8, name: 'MSI Gaming Monitor 27 นิ้ว 180Hz', category: 'monitor', brand: 'MSI', price: 6990, icon: 'MON', description: 'จอเกมมิ่ง 27 นิ้ว ความละเอียด 2560 x 1440 รีเฟรชเรต 180Hz แสดงภาพลื่นไหล สีสันคมชัด', specs: { monitorDisplaySize: '27"', monitorResolution: '2560 x 1440', monitorRefreshRate: '180Hz' } },
  { id: 9, name: 'X870 Pro WiFi DDR5 AM5', category: 'motherboard', brand: 'MSI', price: 9990, icon: 'MB', description: 'เมนบอร์ดชิปเซ็ต X870 รองรับ DDR5 และ WiFi พร้อมภาคจ่ายไฟประสิทธิภาพสูง', specs: { chipset: 'X870' } },
  { id: 10, name: 'DDR5 64GB 6000MHz Dual Kit', category: 'ram', brand: 'ADATA', price: 6890, icon: 'RAM', description: 'แรม DDR5 ความจุ 64GB แบบ Dual Channel เหมาะสำหรับงานหนักและมัลติทาสก์', specs: { memoryCapacity: '64GB (32GBx2)', memoryType: 'DDR5' } },
  { id: 11, name: 'ADATA LEGEND 900 M.2 NVMe Gen4 1TB', category: 'storage', brand: 'ADATA', price: 3990, icon: 'SSD', description: 'SSD M.2 NVMe Gen4 ความจุ 1TB ประสิทธิภาพสูง เปิดโปรแกรมและโหลดไฟล์ขนาดใหญ่ได้รวดเร็ว' },
  { id: 12, name: 'ACER Gaming Monitor 32 นิ้ว 240Hz', category: 'monitor', brand: 'ACER', price: 11900, icon: 'MON', description: 'จอเกมมิ่ง 32 นิ้ว ความละเอียด 4K รีเฟรชเรต 240Hz ตอบสนองรวดเร็วสำหรับการแข่งขัน', specs: { monitorDisplaySize: '32"', monitorResolution: '3840 x 2160', monitorRefreshRate: '240Hz' } },
  { id: 13, name: 'ASUS TUF Gaming 850W 80+ Gold', category: 'psu', brand: 'ASUS', price: 4290, icon: 'PSU', description: 'พาวเวอร์ซัพพลายกำลังไฟ 850W มาตรฐาน 80 Plus Gold จ่ายไฟเสถียรและประหยัดพลังงาน', specs: { continuousPower: 850 } },
  { id: 14, name: 'CORSAIR iCUE H150 RGB 360mm', category: 'cooling', brand: 'CORSAIR', price: 4590, icon: 'AIO', description: 'ชุดน้ำปิดขนาด 360 มม. พร้อมไฟ RGB ช่วยควบคุมอุณหภูมิซีพียูประสิทธิภาพสูงได้อย่างมีประสิทธิภาพ' },
  { id: 15, name: 'LOGITECH Mechanical Keyboard RGB', category: 'keyboard', brand: 'LOGITECH', price: 2490, icon: 'KEY', description: 'คีย์บอร์ดแมคคานิคอลพร้อมไฟ RGB ตอบสนองแม่นยำ เหมาะสำหรับเล่นเกมและทำงาน' },
  { id: 16, name: 'STEELSERIES Wireless Gaming Mouse Pro', category: 'mouse', brand: 'STEELSERIES', price: 1890, icon: 'MOU', description: 'เมาส์เกมมิ่งไร้สายน้ำหนักเบา เซนเซอร์ความแม่นยำสูง และแบตเตอรี่ใช้งานได้ยาวนาน' },
  { id: 17, name: 'AMD Ryzen 5 9600X', category: 'cpu', brand: 'AMD', price: 8990, icon: 'CPU', description: 'ซีพียู 6 คอร์ 12 เธรด รองรับซ็อกเก็ต AM5 เหมาะสำหรับเกมและงานทั่วไป' },
  { id: 18, name: 'GeForce RTX 5060 Ti 16GB', category: 'gpu', brand: 'GIGABYTE', price: 18900, icon: 'GPU', description: 'การ์ดจอหน่วยความจำ 16GB สำหรับเล่นเกมความละเอียดสูงและงานกราฟิก', specs: { gpuSeries: 'NVIDIA GeForce RTX 50 Series', gpuModel: 'GeForce RTX 5060 Ti' } },
  { id: 19, name: 'A520M Pro DDR4 AM4', category: 'motherboard', brand: 'GIGABYTE', price: 5290, icon: 'MB', description: 'เมนบอร์ดขนาด Micro ATX รองรับ AMD AM4 และแรม DDR4 เหมาะสำหรับเครื่องราคาคุ้มค่า', specs: { chipset: 'A520' } },
  { id: 20, name: 'DDR5 16GB 5600MHz', category: 'ram', brand: 'KINGSTON', price: 1990, icon: 'RAM', description: 'แรม DDR5 ความจุ 16GB ความเร็ว 5600MHz สำหรับอัปเกรดคอมพิวเตอร์', specs: { memoryCapacity: '16GB (16GBx1)', memoryType: 'DDR5' } },
  { id: 21, name: 'KINGSTON SATA SSD 2TB', category: 'storage', brand: 'KINGSTON', price: 4690, icon: 'SSD', description: 'SSD SATA ความจุ 2TB เพิ่มความเร็วให้คอมพิวเตอร์ มีพื้นที่จัดเก็บขนาดใหญ่และทำงานเงียบ' },
  { id: 22, name: 'ASUS Gaming Monitor 24 นิ้ว 165Hz', category: 'monitor', brand: 'ASUS', price: 4990, icon: 'MON', description: 'จอเกมมิ่ง 24 นิ้ว ความละเอียด Full HD รีเฟรชเรต 165Hz เหมาะสำหรับเกมที่ต้องการความรวดเร็ว', specs: { monitorDisplaySize: '24"', monitorResolution: '1920 x 1080', monitorRefreshRate: '165Hz' } },
  { id: 23, name: 'CORSAIR CX650 650W 80+ Bronze', category: 'psu', brand: 'CORSAIR', price: 2490, icon: 'PSU', description: 'พาวเวอร์ซัพพลาย 650W มาตรฐาน 80 Plus Bronze สำหรับคอมพิวเตอร์ทั่วไป', specs: { continuousPower: 650 } },
  { id: 24, name: 'CORSAIR RM1000e 1000W 80+ Gold', category: 'psu', brand: 'CORSAIR', price: 6490, icon: 'PSU', description: 'กำลังไฟ 1000W รองรับการ์ดจอระดับสูง พร้อมสายไฟแบบถอดได้', specs: { continuousPower: 1000 } },
  { id: 25, name: 'ASUS TUF Gaming LC 240 ARGB', category: 'cooling', brand: 'ASUS', price: 3290, icon: 'AIO', description: 'ชุดน้ำปิด 240 มม. พร้อมพัดลม ARGB เหมาะกับซีพียูประสิทธิภาพสูงและเคสขนาดกลาง' },
  { id: 26, name: 'MSI MAG CORELIQUID 360R', category: 'cooling', brand: 'MSI', price: 4390, icon: 'AIO', description: 'ชุดน้ำปิดขนาด 360 มม. พร้อมหม้อน้ำและพัดลมสามตัว ช่วยระบายความร้อนสำหรับเกมและงานหนัก' },
  { id: 27, name: 'RAZER Wireless Mechanical Keyboard', category: 'keyboard', brand: 'RAZER', price: 3290, icon: 'KEY', description: 'คีย์บอร์ดแมคคานิคอลไร้สาย เชื่อมต่อได้หลายอุปกรณ์และพิมพ์สบาย' },
  { id: 28, name: 'HYPERX Compact Gaming Keyboard 60%', category: 'keyboard', brand: 'HYPERX', price: 2190, icon: 'KEY', description: 'คีย์บอร์ดเกมมิ่งขนาดกะทัดรัด ประหยัดพื้นที่และตอบสนองรวดเร็ว' },
  { id: 29, name: 'Ergonomic Wireless Mouse', category: 'mouse', brand: 'Logitech', price: 1590, icon: 'MOU', description: 'เมาส์ไร้สายทรง Ergonomic ลดความเมื่อยล้าสำหรับการทำงานเป็นเวลานาน' },
  { id: 30, name: 'Ultralight Gaming Mouse', category: 'mouse', brand: 'Razer', price: 2790, icon: 'MOU', description: 'เมาส์เกมมิ่งน้ำหนักเบา เซนเซอร์แม่นยำและสายยืดหยุ่น' },
  { id: 31, name: 'ASUS Gaming Notebook 15 RTX 5060', category: 'notebook', brand: 'ASUS', price: 39900, icon: 'NB', description: 'โน้ตบุ๊กเกมมิ่งจอ 15.6 นิ้ว แรม 16GB พร้อม SSD 1TB การ์ดจอ RTX และจอรีเฟรชเรตสูง', specs: { notebookStorage: '1TB PCIe 4.0 NVMe M.2 SSD', notebookMemory: '16GB', notebookScreenSize: '15.6"' } },
  { id: 32, name: 'LENOVO Creator Notebook 14 OLED', category: 'notebook', brand: 'LENOVO', price: 35900, icon: 'NB', description: 'โน้ตบุ๊กบางเบาจอ OLED 14 นิ้ว แรม 24GB สีสันแม่นยำ เหมาะสำหรับนักสร้างสรรค์', specs: { notebookStorage: '512GB PCIe 4.0 x4 NVMe M.2 SSD', notebookMemory: '24GB', notebookScreenSize: '14"' } },
  { id: 33, name: 'ACER Business Notebook 16', category: 'notebook', brand: 'ACER', price: 24900, icon: 'NB', description: 'โน้ตบุ๊กจอ 16 นิ้ว แรม 16GB และ SSD 512GB แบตเตอรี่ยาวนาน สำหรับเรียนและทำงาน', specs: { notebookStorage: '512GB PCIe NVMe M.2 SSD', notebookMemory: '16GB', notebookScreenSize: '16"' } },
  { id: 34, name: 'Wireless Game Controller', category: 'accessory', brand: 'Microsoft', price: 2190, icon: 'PAD', description: 'จอยเกมไร้สาย รองรับคอมพิวเตอร์และเชื่อมต่อได้อย่างรวดเร็ว' },
  { id: 35, name: 'USB Streaming Microphone', category: 'accessory', brand: 'HyperX', price: 3490, icon: 'MIC', description: 'ไมโครโฟน USB สำหรับสตรีม ประชุม และบันทึกเสียงได้อย่างคมชัด' },
  { id: 36, name: 'Full HD Streaming Webcam', category: 'accessory', brand: 'Logitech', price: 1990, icon: 'CAM', description: 'เว็บแคม Full HD พร้อมไมโครโฟนในตัวสำหรับประชุมและสตรีม' },
  { id: 37, name: 'Mid Tower Airflow Case', category: 'case', brand: 'Corsair', price: 2990, icon: 'CASE', description: 'เคส Mid Tower เน้นการไหลเวียนอากาศ รองรับการ์ดจอขนาดใหญ่' },
  { id: 38, name: 'ASUS Compact mATX Gaming Case', category: 'case', brand: 'ASUS', price: 1890, icon: 'CASE', description: 'เคสขนาดกะทัดรัด รองรับเมนบอร์ด mATX และจัดสายได้ง่าย' },
  { id: 39, name: 'MSI Premium Panoramic Glass Case', category: 'case', brand: 'MSI', price: 4590, icon: 'CASE', description: 'เคสกระจกพาโนรามาโชว์อุปกรณ์ภายใน พร้อมพื้นที่ติดตั้งชุดน้ำ' },
  { id: 40, name: 'Cloud Wireless Gaming Headset', category: 'headset', brand: 'HyperX', price: 3990, icon: 'HSET', description: 'หูฟังเกมมิ่งไร้สาย เสียงรอบทิศทางและไมโครโฟนตัดเสียงรบกวน' },
  { id: 41, name: 'Lightweight Esports Headset', category: 'headset', brand: 'SteelSeries', price: 2890, icon: 'HSET', description: 'หูฟังน้ำหนักเบาสำหรับแข่งขัน เสียงคมชัดและสวมใส่สบาย' },
  { id: 42, name: 'USB RGB Gaming Headset', category: 'headset', brand: 'Razer', price: 2490, icon: 'HSET', description: 'หูฟังเกมมิ่ง USB พร้อมไฟ RGB และระบบเสียงรอบทิศทาง' },
  { id: 43, name: 'Intel Core i5-14600K', category: 'cpu', brand: 'Intel', price: 10900, icon: 'CPU', description: 'ซีพียู Intel Core i5 ประสิทธิภาพสูง เหมาะสำหรับเล่นเกม สตรีม และทำงานหลายโปรแกรม' },
  { id: 44, name: 'Intel Core i9-14900K', category: 'cpu', brand: 'Intel', price: 21900, icon: 'CPU', description: 'ซีพียู Intel Core i9 ระดับเรือธง รองรับงานหนัก เกม และงานสร้างสรรค์ระดับมืออาชีพ' },
  { id: 45, name: 'Intel Core Ultra 9 285K', category: 'cpu', brand: 'Intel', price: 23900, icon: 'CPU', description: 'หน่วยประมวลผล Intel Core Ultra 9 รุ่นใหม่ ให้ประสิทธิภาพสูงสำหรับเกมและงานมัลติทาสก์' },
  { id: 46, name: 'H610M DDR4 LGA1700', category: 'motherboard', brand: 'ASROCK', price: 2890, icon: 'MB', description: 'เมนบอร์ด Intel H610 ขนาด Micro ATX รองรับแรม DDR4 เหมาะสำหรับคอมทำงานราคาคุ้มค่า', specs: { chipset: 'H610' } },
  { id: 47, name: 'B550M Gaming DDR4 AM4', category: 'motherboard', brand: 'COLORFUL', price: 3990, icon: 'MB', description: 'เมนบอร์ด AMD B550 รองรับ Ryzen ซ็อกเก็ต AM4 และ PCIe 4.0 สำหรับเกมมิ่งพีซี', specs: { chipset: 'B550' } },
  { id: 48, name: 'GeForce RTX 5090 32GB', category: 'gpu', brand: 'MSI', price: 89900, icon: 'GPU', description: 'การ์ดจอระดับเรือธง หน่วยความจำ 32GB สำหรับเกม 4K งาน AI และงานเรนเดอร์ระดับสูง', specs: { gpuSeries: 'NVIDIA GeForce RTX 50 Series', gpuModel: 'GeForce RTX 5090' } },
  { id: 49, name: 'GeForce RTX 5080 16GB', category: 'gpu', brand: 'ZOTAC', price: 45900, icon: 'GPU', description: 'การ์ดจอประสิทธิภาพสูงสำหรับเล่นเกม 4K พร้อมระบบระบายความร้อนแบบสามพัดลม', specs: { gpuSeries: 'NVIDIA GeForce RTX 50 Series', gpuModel: 'GeForce RTX 5080' } },
  { id: 50, name: 'GeForce RTX 4070 SUPER 12GB', category: 'gpu', brand: 'PALIT', price: 23900, icon: 'GPU', description: 'การ์ดจอสำหรับเกมความละเอียด 1440p ให้ประสิทธิภาพดีและใช้พลังงานอย่างคุ้มค่า', specs: { gpuSeries: 'NVIDIA GeForce RTX 40 Series', gpuModel: 'GeForce RTX 4070 SUPER' } },
  { id: 51, name: 'Radeon RX 7900 XTX 24GB', category: 'gpu', brand: 'POWER COLOR', price: 37900, icon: 'GPU', description: 'การ์ดจอ AMD ระดับสูง หน่วยความจำ 24GB สำหรับเกม 4K และงานสร้างสรรค์', specs: { gpuSeries: 'AMD Radeon RX 7000 Series', gpuModel: 'Radeon RX 7900 XTX' } },
  { id: 52, name: 'Radeon RX 7800 XT 16GB', category: 'gpu', brand: 'XFX', price: 20900, icon: 'GPU', description: 'การ์ดจอหน่วยความจำ 16GB เหมาะสำหรับเกม 1440p และการใช้งานหลายจอ', specs: { gpuSeries: 'AMD Radeon RX 7000 Series', gpuModel: 'Radeon RX 7800 XT' } },
  { id: 53, name: 'Intel Arc B580 12GB', category: 'gpu', brand: 'ASROCK', price: 10900, icon: 'GPU', description: 'การ์ดจอ Intel Arc รุ่นใหม่ หน่วยความจำ 12GB รองรับเกมและงานตัดต่อวิดีโอ', specs: { gpuSeries: 'Intel Arc B Series', gpuModel: 'Intel Arc B580' } },
  { id: 54, name: 'DDR4 8GB 3200MHz', category: 'ram', brand: 'APACER', price: 790, icon: 'RAM', description: 'แรม DDR4 ความจุ 8GB ความเร็ว 3200MHz สำหรับอัปเกรดคอมพิวเตอร์ใช้งานทั่วไป', specs: { memoryCapacity: '8GB (8GBx1)', memoryType: 'DDR4' } },
  { id: 55, name: 'DDR4 16GB 3200MHz Dual Kit', category: 'ram', brand: 'HIKSEMI', price: 1490, icon: 'RAM', description: 'แรม DDR4 แบบ Dual Channel ความจุรวม 16GB เหมาะสำหรับเล่นเกมและทำงาน', specs: { memoryCapacity: '16GB (8GBx2)', memoryType: 'DDR4' } },
  { id: 56, name: 'DDR5 RGB 32GB 6400MHz Dual Kit', category: 'ram', brand: 'LEXAR', price: 4290, icon: 'RAM', description: 'แรม DDR5 พร้อมไฟ RGB ความจุ 32GB และความเร็ว 6400MHz สำหรับเกมมิ่งพีซี', specs: { memoryCapacity: '32GB (2x 16GB)', memoryType: 'DDR5' } },
  { id: 57, name: 'DDR4 16GB 3600MHz Dual Kit', category: 'ram', brand: 'GEIL', price: 1790, icon: 'RAM', description: 'แรม DDR4 แบบ Dual Channel ความจุรวม 16GB ความเร็ว 3600MHz สำหรับเล่นเกมและทำงาน', specs: { memoryCapacity: '16GB (2x 8GB)', memoryType: 'DDR4' } },
  { id: 58, name: 'SEAGATE BARRACUDA HDD 2TB 7200RPM', category: 'storage', brand: 'SEAGATE', price: 2190, icon: 'HDD', description: 'ฮาร์ดดิสก์ขนาด 3.5 นิ้ว ความจุ 2TB เหมาะสำหรับเก็บเกม รูปภาพ วิดีโอ และสำรองข้อมูล' },
  { id: 59, name: 'WESTERN DIGITAL BLUE HDD 4TB', category: 'storage', brand: 'WESTERN DIGITAL', price: 3490, icon: 'HDD', description: 'ฮาร์ดดิสก์ความจุ 4TB สำหรับคอมพิวเตอร์เดสก์ท็อป ให้พื้นที่เก็บข้อมูลขนาดใหญ่และทำงานเสถียร' },
  { id: 60, name: 'SAMSUNG 990 EVO PLUS M.2 NVMe 2TB', category: 'storage', brand: 'SAMSUNG', price: 5790, icon: 'SSD', description: 'M.2 NVMe SSD ความจุ 2TB ความเร็วสูง เหมาะสำหรับเกม งานสร้างสรรค์ และการโอนไฟล์ขนาดใหญ่' },
  { id: 61, name: 'MSI MAG A750GL 750W 80+ Gold', category: 'psu', brand: 'MSI', price: 3690, icon: 'PSU', description: 'พาวเวอร์ซัพพลาย 750W มาตรฐาน 80 Plus Gold รองรับเกมมิ่งพีซีและสายไฟแบบถอดได้', specs: { continuousPower: 750 } },
  { id: 62, name: 'GIGABYTE UD850GM 850W 80+ Gold', category: 'psu', brand: 'GIGABYTE', price: 3990, icon: 'PSU', description: 'พาวเวอร์ซัพพลาย 850W จ่ายไฟเสถียร เหมาะสำหรับซีพียูและการ์ดจอประสิทธิภาพสูง', specs: { continuousPower: 850 } },
  { id: 63, name: 'ASUS ROG STRIX 1200W 80+ Platinum', category: 'psu', brand: 'ASUS', price: 8990, icon: 'PSU', description: 'พาวเวอร์ซัพพลายระดับสูง 1200W สำหรับเกมมิ่งพีซีและเวิร์กสเตชันที่ใช้การ์ดจอระดับเรือธง', specs: { continuousPower: 1200 } },
  { id: 64, name: 'GIGABYTE AORUS ATC800 CPU AIR COOLER', category: 'cooling', brand: 'GIGABYTE', price: 2490, icon: 'FAN', description: 'ฮีตซิงก์ลมทรงทาวเวอร์คู่พร้อมพัดลม RGB ระบายความร้อนได้ดี เหมาะสำหรับเกมมิ่งพีซี' },
  { id: 65, name: 'CORSAIR AF120 RGB ELITE 120mm', category: 'cooling', brand: 'CORSAIR', price: 790, icon: 'FAN', description: 'พัดลมเคสขนาด 120 มม. พร้อมไฟ RGB ให้แรงลมดีและช่วยจัดการอุณหภูมิภายในเคส' },
]

// Test accounts. Passwords are hashed with bcrypt at runtime so login works.
const users = [
  { email: 'admin@primepc.com', password: 'Admin1234', name: 'Admin PrimePC', phone: '0912345678', address: '123 Admin St., Bangkok', role: 'ADMIN' },
  { email: 'staff@primepc.com', password: 'Staff1234', name: 'Staff PrimePC', phone: '0923456789', address: '456 Staff Rd., Bangkok', role: 'STAFF' },
  { email: 'customer@primepc.com', password: 'Customer1234', name: 'Customer Demo', phone: '0934567890', address: '789 Customer Ave., Bangkok', role: 'CUSTOMER' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1) Users (upsert so re-running the seed is safe)
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      // Reset password too, so re-seeding an existing account restores the
      // known test credentials (idempotent for all fields, not just profile).
      update: { name: u.name, phone: u.phone, address: u.address, role: u.role, password: hashed },
      create: { ...u, password: hashed },
    });
  }
  console.log(`✅ ${users.length} users ready (admin / staff / customer)`);

  // 2) Products — pinned ids, specs -> JSON, stock derived from out-of-stock list
  for (const p of productCatalog) {
    const stock = outOfStockIds.has(p.id) ? 0 : 10;
    const data = {
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      stock,
      category: p.category,
      categoryName: categoryNames[p.category] ?? p.category,
      brand: p.brand ?? null,
      icon: p.icon ?? null,
      imageUrl: p.imageUrl ?? null,
      specs: p.specs ?? {},
      isAvailable: true,
    };
    await prisma.product.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
  }
  console.log(`✅ ${productCatalog.length} products ready (ids 1..${productCatalog.length})`);

  // 3) Keep the id sequence ahead of the pinned ids (PostgreSQL)
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products))`
    );
  } catch (err) {
    console.warn('⚠️  Could not reset product id sequence:', err.message);
  }

  console.log('🎉 Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
