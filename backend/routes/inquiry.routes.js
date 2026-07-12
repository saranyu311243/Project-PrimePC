const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

/**
 * @swagger
 * tags:
 *   name: Inquiries
 *   description: Customer inquiries and responses
 */

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     tags: [Inquiries]
 *     summary: Create a new inquiry (customer)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inquiry created
 */
router.post('/', verifyToken, inquiryController.createInquiry);

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     tags: [Inquiries]
 *     summary: Get all inquiries (Staff/Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inquiries
 */
router.get('/', verifyToken, checkRole('STAFF', 'ADMIN'), inquiryController.getInquiries);

/**
 * @swagger
 * /api/inquiries/{id}/respond:
 *   put:
 *     tags: [Inquiries]
 *     summary: Respond to an inquiry (Staff/Admin)
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
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inquiry responded
 */
router.put('/:id/respond', verifyToken, checkRole('STAFF', 'ADMIN'), inquiryController.respondInquiry);

module.exports = router;
