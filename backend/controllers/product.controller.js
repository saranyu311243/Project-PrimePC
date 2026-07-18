const prisma = require('../lib/prisma');
const { parsePositiveInt, parsePagination } = require('../lib/validation');
const { PRODUCT_CATEGORIES } = require('../lib/categories');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 12 });

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

    // Advanced Search: Split by spaces and search across multiple fields
    if (search) {
      const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0);
      if (searchTerms.length > 0) {
        where.AND = searchTerms.map(term => ({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } },
            { categoryName: { contains: term, mode: 'insensitive' } },
            { brand: { contains: term, mode: 'insensitive' } }
          ]
        }));
      }
    }

    // Only show available products
    where.isAvailable = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
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
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await prisma.product.findUnique({
      where: { id }
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
    const { name, description, price, stock, imageUrl, category, brand, specs } = req.body;
    const isPlainObject = specs && typeof specs === 'object' && !Array.isArray(specs);

    if (category !== undefined && !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        category,
        brand,
        specs: isPlainObject ? specs : {}
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
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    const { name, description, price, stock, imageUrl, category, brand, isAvailable, specs } = req.body;
    const isPlainObject = specs && typeof specs === 'object' && !Array.isArray(specs);

    // Validation
    const isValidNumber = (v) => (typeof v === 'number' || typeof v === 'string') && v !== '' && Number.isFinite(Number(v));

    if (price !== undefined && (!isValidNumber(price) || Number(price) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
      });
    }

    if (stock !== undefined && (!isValidNumber(stock) || Number(stock) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid non-negative number'
      });
    }

    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean'
      });
    }

    if (category !== undefined && !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        imageUrl,
        category,
        brand,
        isAvailable,
        specs: isPlainObject ? specs : undefined
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
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemCount > 0) {
      // มีประวัติการสั่งซื้อ → soft-delete: ปิดการขายแทนการลบจริงง
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
