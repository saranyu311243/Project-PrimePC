const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const { sanitizeInput } = require('../middlewares/validateInput');

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
router.post('/', verifyToken, sanitizeInput, inquiryController.createInquiry);

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     tags: [Inquiries]
 *     summary: Get inquiries (Customer sees own, Staff/Admin sees all)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inquiries
 */
router.get('/', verifyToken, inquiryController.getInquiries);

/**
 * @swagger
 * /api/inquiries/all:
 *   get:
 *     summary: Get all inquiries with filters (Staff/Admin only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all inquiries
 */
router.get('/all', verifyToken, checkRole('STAFF', 'ADMIN'), inquiryController.getAllInquiries);

/**
 * @swagger
 * /api/inquiries/{id}:
 *   get:
 *     tags: [Inquiries]
 *     summary: Get inquiry by ID
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
 *         description: Inquiry details
 */
router.get('/:id', verifyToken, inquiryController.getInquiryById);

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
router.put('/:id/respond', verifyToken, checkRole('STAFF', 'ADMIN'), sanitizeInput, inquiryController.respondInquiry);

/**
 * @swagger
 * /api/inquiries/{id}/close:
 *   put:
 *     summary: Close an inquiry (Staff/Admin only)
 *     tags: [Inquiries]
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
 *         description: Inquiry closed
 */
router.put('/:id/close', verifyToken, checkRole('STAFF', 'ADMIN'), inquiryController.closeInquiry);

module.exports = router;
