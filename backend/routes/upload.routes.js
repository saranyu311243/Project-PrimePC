const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const uploadController = require('../controllers/upload.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Wrap multer so file-too-large / malformed multipart errors come back as 400s
// instead of falling through to the generic 500 error handler.
const singleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Upload error' });
    }
    next();
  });
};

/**
 * @swagger
 * /api/product-images:
 *   post:
 *     summary: Upload a product image into a category folder (Staff/Admin only)
 *     tags: [ProductImages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 */
router.post('/', verifyToken, checkRole('STAFF', 'ADMIN'), uploadLimiter, singleImage, uploadController.uploadImage);

/**
 * @swagger
 * /api/product-images:
 *   get:
 *     summary: List images in a category folder (Staff/Admin only)
 *     tags: [ProductImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of images
 */
router.get('/', verifyToken, checkRole('STAFF', 'ADMIN'), uploadController.listImages);

/**
 * @swagger
 * /api/product-images:
 *   delete:
 *     summary: Delete an image from storage (Staff/Admin only)
 *     tags: [ProductImages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete('/', verifyToken, checkRole('STAFF', 'ADMIN'), uploadController.deleteImage);

module.exports = router;
