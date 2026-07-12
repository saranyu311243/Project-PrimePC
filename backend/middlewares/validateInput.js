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
  if (isNaN(price) || isNaN(stock)) {
    return res.status(400).json({
      success: false,
      message: 'Price and stock must be numbers'
    });
  }

  // ตรวจสอบว่า price และ stock เป็นค่าบวก
  if (parseFloat(price) < 0 || parseInt(stock) < 0) {
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
  // ป้องกัน XSS โดยการ trim และลบ script tags
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
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

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCartItem,
  sanitizeInput
};
