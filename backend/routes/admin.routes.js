const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', verifyToken, checkRole('ADMIN'), adminController.getDashboard);

module.exports = router;
