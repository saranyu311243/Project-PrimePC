const rateLimit = require('express-rate-limit');

// Rate limiter สำหรับ login/register (ป้องกัน brute force)
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

module.exports = {
  authLimiter,
  apiLimiter
};
