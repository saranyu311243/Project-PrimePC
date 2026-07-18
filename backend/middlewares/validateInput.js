// Middleware สำหรับ validate input และป้องกัน XSS, SQL Injection

const validateRegister = (req, res, next) => {
  const { email, password, name, phone } = req.body;

  // ตรวจสอบว่ามีข้อมูลครบไหม
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }

  // Validate phone (ถ้ามี)
  if (phone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format (must be 10 digits)'
      });
    }
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Name, price, and stock are required'
    });
  }

  // ตรวจสอบว่า price และ stock เป็นตัวเลข
  const isValidNumber = (v) => (typeof v === 'number' || typeof v === 'string') && v !== '' && Number.isFinite(Number(v));

  if (!isValidNumber(price) || !isValidNumber(stock)) {
    return res.status(400).json({
      success: false,
      message: 'Price and stock must be numbers'
    });
  }

  // ตรวจสอบว่า price และ stock เป็นค่าบวก
  if (Number(price) < 0 || Number(stock) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price and stock must be positive numbers'
    });
  }

  next();
};

const validateCartItem = (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  if (quantity !== undefined) {
    if (isNaN(quantity) || parseInt(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }
  }

  next();
};

const sanitizeInput = (req, res, next) => {
  // ป้องกัน XSS โดยการ trim และลบ HTML tag ทั้งหมด (ไม่ใช่แค่ <script>...</script> —
  // การไล่ blacklist แค่ pattern เดียวหลุดง่ายมาก เช่น <img onerror=...>, <svg onload=...>)
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<[^>]*>/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  req.body = sanitize(req.body);
  next();
};

// Update endpoint ใช้ partial update ได้ (field ไหนไม่ส่งมาก็ไม่ต้องแตะ) แต่ field
// ที่ส่งมาต้องผ่านกฎเดียวกับตอน register — ห้ามเซ็ตชื่อว่าง/เบอร์โทรผิดรูปแบบ
const validateProfileUpdate = (req, res, next) => {
  const { name, phone } = req.body;

  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name cannot be empty'
    });
  }

  if (phone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(String(phone).replace(/-/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format (must be 10 digits)'
      });
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCartItem,
  validateProfileUpdate,
  sanitizeInput
};
