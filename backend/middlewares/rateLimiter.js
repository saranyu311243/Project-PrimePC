const rateLimit = require('express-rate-limit');

// Rate limiter สำหรับ login/register (ป้องกัน brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // จำกัด 5 ครั้งต่อ IP
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
