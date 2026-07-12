const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const { sanitizeInput } = require('../middlewares/validateInput');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and retrieval
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', verifyToken, sanitizeInput, orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get list of orders (admin/staff or own orders for customer)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', verifyToken, orderController.getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', verifyToken, orderController.getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (Staff/Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/status', verifyToken, checkRole('STAFF', 'ADMIN'), orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/customer/{id}/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders by customer ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer orders
 */
router.get('/customer/:id/orders', verifyToken, orderController.getOrdersByCustomer);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (Customer or Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
