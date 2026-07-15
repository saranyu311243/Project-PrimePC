  require('dotenv').config();
  const express = require("express");
  const cors = require("cors");
  const helmet = require("helmet");
  const swaggerUi = require("swagger-ui-express");
  const swaggerJsdoc = require("swagger-jsdoc");
  const { apiLimiter } = require('./middlewares/rateLimiter');

  // Validate critical environment variables
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set in environment variables');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('CRITICAL: DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  const app = express();

  // Security Middleware
  app.use(helmet()); // ป้องกัน security headers

  // Allow multiple frontend origins (dev + production static site)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://project-prime-pc.vercel.app',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((o) => o.trim()) : []),
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
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
    console.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.status(err.status || 500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
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
