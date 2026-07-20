import accessoryImage from '../assets/categories/category-accessory.png'
import caseImage from '../assets/categories/category-case.png'
import coolingImage from '../assets/categories/category-cooling.png'
import cpuImage from '../assets/categories/category-cpu.png'
import gpuImage from '../assets/categories/category-gpu.png'
import headsetImage from '../assets/categories/category-headset.png'
import keyboardImage from '../assets/categories/category-keyboard.png'
import mainboardImage from '../assets/categories/category-mainboard.png'
import monitorImage from '../assets/categories/category-monitor.png'
import mouseImage from '../assets/categories/category-mouse.png'
import notebookImage from '../assets/categories/category-notebook.png'
import psuImage from '../assets/categories/category-psu.png'
import ramImage from '../assets/categories/category-ram.png'
import storageImage from '../assets/categories/category-storage.png'

const header = (image, title, thaiTitle, heading, description) => ({ image, title, thaiTitle, heading, description, alt: heading })

export const categoryHeaders = {
  cpu: header(cpuImage, 'CPU', 'ซีพียู', 'CPU ประสิทธิภาพสูง สำหรับเล่นเกมและทำงาน', 'เลือกซีพียูที่เหมาะกับการใช้งาน ตั้งแต่รุ่นคุ้มค่าจนถึงรุ่นประสิทธิภาพสูง'),
  motherboard: header(mainboardImage, 'MAINBOARD', 'เมนบอร์ด', 'เมนบอร์ดคุณภาพ รองรับทุกสเปกและการอัปเกรด', 'เลือกเมนบอร์ดให้ตรงกับซีพียู ชิปเซ็ต และอุปกรณ์ที่ต้องการ'),
  gpu: header(gpuImage, 'GRAPHIC CARD', 'การ์ดจอ', 'การ์ดจอสำหรับเล่นเกม ทำงาน และตัดต่อวิดีโอ', 'รวมการ์ดจอสำหรับเกม งานกราฟิก และงานสร้างสรรค์หลากหลายระดับ'),
  ram: header(ramImage, 'RAM', 'แรม', 'RAM คุณภาพ เพิ่มความลื่นไหลให้ทุกการใช้งาน', 'เลือกแรม DDR4 และ DDR5 ตามความจุและรูปแบบที่ต้องการ'),
  storage: header(storageImage, 'STORAGE', 'หน่วยเก็บข้อมูล', 'ฮาร์ดดิสก์และเอสเอสดีสำหรับคอมพิวเตอร์', 'รวม HDD, SATA SSD และ M.2 NVMe สำหรับเก็บข้อมูลและเพิ่มความเร็ว'),
  psu: header(psuImage, 'POWER SUPPLY', 'พาวเวอร์ซัพพลาย', 'Power Supply คุณภาพ จ่ายไฟเสถียร', 'เลือกกำลังไฟให้เหมาะกับซีพียูและการ์ดจอของคุณ'),
  cooling: header(coolingImage, 'COOLING SYSTEM', 'ชุดระบายความร้อน', 'ชุดระบายความร้อน CPU คุณภาพดี', 'รวมฮีตซิงก์ลม ชุดน้ำปิด และพัดลมเคส'),
  notebook: header(notebookImage, 'NOTEBOOK', 'โน้ตบุ๊ก', 'โน้ตบุ๊กสำหรับทำงาน เรียน และเล่นเกม', 'เลือกพื้นที่จัดเก็บ หน่วยความจำ และขนาดหน้าจอให้ตรงกับงาน'),
  monitor: header(monitorImage, 'MONITOR', 'จอมอนิเตอร์', 'จอมอนิเตอร์สำหรับเล่นเกมและทำงาน', 'เลือกขนาด ความละเอียด และ Refresh Rate ที่เหมาะกับคุณ'),
  keyboard: header(keyboardImage, 'KEYBOARD', 'คีย์บอร์ด', 'คีย์บอร์ดสำหรับเล่นเกมและทำงาน', 'รวมคีย์บอร์ดเกมมิ่ง Mechanical และคีย์บอร์ดไร้สาย'),
  mouse: header(mouseImage, 'MOUSE', 'เมาส์', 'เมาส์สำหรับเล่นเกมและทำงาน', 'รวมเมาส์เกมมิ่ง เมาส์ไร้สาย และเมาส์ Ergonomic'),
  accessory: header(accessoryImage, 'ACCESSORIES', 'อุปกรณ์เสริม', 'อุปกรณ์เสริมคอมพิวเตอร์', 'รวมไมโครโฟน เว็บแคม และจอยเกม'),
  case: header(caseImage, 'COMPUTER CASE', 'เคสคอมพิวเตอร์', 'เคสคอมพิวเตอร์สวย ระบายอากาศดี', 'เลือกเคส Airflow เคสกระจก และเคสขนาดกะทัดรัด'),
  headset: header(headsetImage, 'HEADSET', 'หูฟัง', 'หูฟังเกมมิ่งและหูฟังคอมพิวเตอร์', 'เสียงคมชัด สวมใส่สบาย พร้อมไมโครโฟน'),
}

export const homeBrandOptions = ['ASUS', 'MSI', 'INTEL', 'AMD', 'LENOVO', 'GIGABYTE', 'CORSAIR', 'LOGITECH', 'KINGSTON', 'HYPERX', 'RAZER', 'NVIDIA', 'ACER', 'STEELSERIES']

export const categorySearchAliases = {
  cpu: ['cpu', 'processor', 'ซีพียู', 'หน่วยประมวลผล'],
  motherboard: ['mainboard', 'motherboard', 'mb', 'เมนบอร์ด'],
  gpu: ['gpu', 'vga', 'graphic card', 'graphics card', 'การ์ดจอ'],
  ram: ['ram', 'memory', 'แรม'],
  storage: ['storage', 'ssd', 'hdd', 'harddisk', 'hard drive', 'ฮาร์ดดิสก์', 'เอสเอสดี'],
  psu: ['psu', 'power supply', 'พาวเวอร์ซัพพลาย'],
  cooling: ['cooling', 'cooler', 'fan', 'ชุดระบายความร้อน', 'พัดลม'],
  notebook: ['notebook', 'laptop', 'โน้ตบุ๊ก', 'แล็ปท็อป'],
  monitor: ['monitor', 'display', 'จอคอม', 'จอมอนิเตอร์'],
  keyboard: ['keyboard', 'คีย์บอร์ด'],
  mouse: ['mouse', 'เมาส์'],
  accessory: ['accessory', 'accessories', 'อุปกรณ์เสริม', 'ไมค์', 'ไมโครโฟน', 'webcam'],
  case: ['case', 'computer case', 'เคส'],
  headset: ['headset', 'headphone', 'หูฟัง'],
}

const values = (label, field, options, match = 'exact') => ({ label, field, options, match })
export const categoryFilterDefinitions = {
  cpu: [values('Processor Number', 'name', ['CORE i3', 'CORE i5', 'CORE i7', 'CORE i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'ULTRA 5', 'ULTRA 7', 'ULTRA 9'], 'includes')],
  motherboard: [values('Chipset', 'chipset', ['H610', 'B550', 'A520', 'X670', 'Z790', 'B760', 'B650', 'X870', 'Z890', 'B860', 'B850', 'H810', 'A620A', 'B840'])],
  gpu: [
    values('GPU Series', 'gpuSeries', ['NVIDIA GeForce RTX 50 Series', 'NVIDIA GeForce RTX 40 Series', 'AMD Radeon RX 9000 Series', 'AMD Radeon RX 7000 Series', 'Intel Arc A Series', 'Intel Arc B Series']),
  ],
  ram: [values('Memory Capacity', 'memoryCapacity', ['8GB (8GBx1)', '16GB (16GBx1)', '16GB (8GBx2)', '16GB (2x 8GB)', '32GB (16GBx2)', '32GB (2x 16GB)', '32GB (32GBx1)', '64GB (32GBx2)', '64GB (64GBx1)']), values('Memory Type', 'memoryType', ['DDR5', 'DDR4'])],
  storage: [values('Storage Type', 'storageType', ['Solid State Drive', 'Hard Disk Drive']), values('Capacity', 'capacity', ['256GB', '512GB', '1TB', '2TB', '4TB'])],
  psu: [values('Continuous Power W', 'continuousPower', [550, 600, 650, 750, 850, 1000, 1050, 1200, 1250, 1300, 3000])],
  cooling: [values('Cooling Type', 'coolingType', ['Liquid Cooling', 'Air Cooling', 'Case Fan'])],
  notebook: [values('Screen Size', 'notebookScreenSize', ['13.3"', '13.4"', '13.6"', '14"', '15.6"', '16"'])],
  monitor: [values('Display Size', 'monitorDisplaySize', ['15"', '16"', '22"', '23.8"', '24"', '24.5"', '25"', '27"', '32"', '34"']), values('Resolution', 'monitorResolution', ['1280 x 720', '1920 x 1080', '2560 x 1440', '2560 x 1600', '3440 x 1440', '3840 x 2160', '5120 x 2880']), values('Refresh Rate', 'monitorRefreshRate', ['60Hz', '100Hz', '120Hz', '144Hz', '165Hz', '180Hz', '240Hz', '280Hz', '300Hz', '360Hz', '480Hz', '540Hz'])],
}
