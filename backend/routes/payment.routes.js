const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const { criticalLimiter } = require('../middlewares/criticalRateLimiter');
const { sanitizeInput } = require('../middlewares/validateInput');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing
 */

/**
 * @swagger
 * /api/payments/options:
 *   get:
 *     tags: [Payments]
 *     summary: Get available payment options
 *     responses:
 *       200:
 *         description: Payment options
 */
router.get('/options', paymentController.getPaymentOptions);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment for an order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post('/', criticalLimiter, verifyToken, sanitizeInput, paymentController.createPayment);

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by order ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment details
 */
router.get('/order/:orderId', verifyToken, paymentController.getPaymentByOrder);

/**
 * @swagger
 * /api/payments/{id}/confirm:
 *   put:
 *     tags: [Payments]
 *     summary: Confirm or update payment status (Staff/Admin)
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
 *         description: Payment confirmed/updated
 */
router.put('/:id/confirm', verifyToken, checkRole('STAFF', 'ADMIN'), paymentController.confirmPayment);

module.exports = router;
