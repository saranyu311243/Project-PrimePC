require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Security Middleware
app.use(helmet()); // ป้องกัน security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // จำกัดขนาด request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrimePC API',
      version: '1.0.0',
      description: 'API Documentation for PrimePC - Computer Parts E-Commerce',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home API
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/", (req, res) => {
  res.json({
    message: "PrimePC API",
    version: "1.0.0",
    documentation: "/api-docs"
  });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const shipmentRoutes = require('./routes/shipment.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const adminRoutes = require('./routes/admin.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
