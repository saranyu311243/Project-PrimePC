const rateLimit = require('express-rate-limit');

// Rate limiter สำหรับ login (ป้องกัน brute force)
// นับเฉพาะ request ที่ล้มเหลว (skipSuccessfulRequests) เพื่อไม่รบกวนการใช้งานปกติ
// แต่ยังบล็อกการเดารหัสผ่านซ้ำ ๆ ได้
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10, // จำกัด 10 ครั้งที่ล้มเหลวต่อ IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter แยกสำหรับ register — ใช้ budget คนละก้อนกับ login โดยเจตนา
// เพราะพิมพ์อีเมล/รหัสผ่านผิดตอนสมัคร (400 จาก validation) ไม่ใช่การ brute-force
// เดารหัสผ่านคนอื่น ไม่ควรไปกินโควตาจนล็อกไม่ให้ login บัญชีที่มีอยู่แล้วได้
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10, // จำกัด 10 ครั้งที่ล้มเหลวต่อ IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many registration attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter สำหรับ API ทั่วไป
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 นาที
  max: 100, // จำกัด 100 requests ต่อนาที
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter สำหรับอัปโหลดรูปสินค้า (STAFF/ADMIN) — กันการอัปโหลดถล่ม storage
// แต่ยังเผื่อพอสำหรับงาน bulk seed สินค้าจำนวนมากของแอดมิน
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 200, // จำกัด 200 อัปโหลดต่อ IP ต่อ 15 นาที
  message: {
    success: false,
    message: 'Too many image uploads, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  registerLimiter,
  apiLimiter,
  uploadLimiter
};
