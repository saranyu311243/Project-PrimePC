const prisma = require('../lib/prisma');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by brand
    if (brand) {
      where.brand = brand;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Only show available products
    where.isAvailable = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Create product (Staff/Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category, brand } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        category,
        brand
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Update product (Staff/Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, category, brand, isAvailable } = req.body;

    // Validation
    if (price !== undefined && (isNaN(price) || parseFloat(price) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
      });
    }

    if (stock !== undefined && (isNaN(stock) || parseInt(stock) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid non-negative number'
      });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        imageUrl,
        category,
        brand,
        isAvailable
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Delete product (Admin only)
// ถ้าสินค้าเคยถูกสั่งซื้อ จะ soft-delete (ปิดการขาย) เพื่อรักษาประวัติออเดอร์ไว้
// เพราะ OrderItem ผูกกับ Product แบบ onDelete: Cascade การลบจริงจะทำให้ประวัติหาย
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemCount > 0) {
      // มีประวัติการสั่งซื้อ → soft-delete: ปิดการขายแทนการลบจริง
      await prisma.product.update({
        where: { id },
        data: { isAvailable: false }
      });
      return res.json({
        success: true,
        message: 'Product has order history — marked as unavailable instead of deleting'
      });
    }

    // ไม่เคยถูกสั่งซื้อ → ลบจริงได้อย่างปลอดภัย
    await prisma.product.delete({ where: { id } });
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
