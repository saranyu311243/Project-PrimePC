const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment.controller');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const { sanitizeInput } = require('../middlewares/validateInput');

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Shipment management
 */

/**
 * @swagger
 * /api/shipments:
 *   post:
 *     tags: [Shipments]
 *     summary: Create a shipment for an order (Staff/Admin)
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
 *               trackingNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shipment created
 */
router.post('/', verifyToken, checkRole('STAFF', 'ADMIN'), sanitizeInput, shipmentController.createShipment);

/**
 * @swagger
 * /api/shipments/{id}/status:
 *   put:
 *     tags: [Shipments]
 *     summary: Update shipment status (Staff/Admin)
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
 *         description: Shipment updated
 */
router.put('/:id/status', verifyToken, checkRole('STAFF', 'ADMIN'), shipmentController.updateShipmentStatus);

/**
 * @swagger
 * /api/shipments:
 *   get:
 *     tags: [Shipments]
 *     summary: Get all shipments (Staff/Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shipments
 */
router.get('/', verifyToken, checkRole('STAFF', 'ADMIN'), shipmentController.getAllShipments);

/**
 * @swagger
 * /api/shipments/order/{orderId}:
 *   get:
 *     tags: [Shipments]
 *     summary: Get shipment by order ID
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
 *         description: Shipment details
 */
router.get('/order/:orderId', verifyToken, shipmentController.getShipmentByOrderId);

module.exports = router;
