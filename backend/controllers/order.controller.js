const prisma = require('../lib/prisma');

// Validate order status enum
const validOrderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

// Create order with proper validation and transaction
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { items = [], shippingAddress } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Validate all items and calculate total amount on server
    let calculatedTotalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // ตรวจสอบว่ามี productId และ quantity
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId and quantity'
        });
      }

      const quantity = parseInt(item.quantity);
      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      // ดึงข้อมูลสินค้าจริงจาก database
      const product = await prisma.product.findUnique({
        where: { id: parseInt(item.productId) }
      });

      // ตรวจสอบว่าสินค้ามีอยู่จริง
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ID ${item.productId} not found`
        });
      }

      // ตรวจสอบว่าสินค้ายังพร้อมขาย
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`
        });
      }

      // ตรวจสอบ stock
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${quantity}`
        });
      }

      // คำนวณราคาจากฝั่ง server (ใช้ราคาจริงจาก database)
      const itemTotal = product.price * quantity;
      calculatedTotalAmount += itemTotal;

      validatedItems.push({
        productId: product.id,
        quantity: quantity,
        price: product.price, // ใช้ราคาจริงจาก database เท่านั้น
        product: product // เก็บไว้สำหรับลด stock
      });
    }

    // ใช้ Transaction เพื่อความปลอดภัย
    const result = await prisma.$transaction(async (tx) => {
      // 1. สร้าง Order (ใช้ totalAmount ที่คำนวณจากฝั่ง server)
      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          totalAmount: calculatedTotalAmount,
          shippingAddress: shippingAddress.trim(),
          status: 'PENDING'
        }
      });

      // 2. สร้าง Order Items และลด Stock
      const orderItems = [];
      for (const item of validatedItems) {
        // สร้าง order item
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        });
        orderItems.push(orderItem);

        // ลด stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return { order, items: orderItems };
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all orders or user's orders
const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let where = {};
    if (req.user && req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    } else if (req.query.userId) {
      where.userId = parseInt(req.query.userId);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          payment: true,
          shipment: true
        },
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        payment: true,
        shipment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Access control: customers can only view their orders
    if (req.user && req.user.role === 'CUSTOMER' && req.user.id !== order.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status enum
    if (!status || !validOrderStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validOrderStatuses.join(', ')}`
      });
    }

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Business logic: cannot change status of cancelled order
    if (currentOrder.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status of cancelled order'
      });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

const getOrdersByCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(id) },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        payment: true,
        shipment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer orders',
      error: error.message
    });
  }
};

// Cancel order with stock restoration
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if customer owns this order
    if (req.user.role === 'CUSTOMER' && req.user.id !== order.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (['SHIPPING', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Use transaction to cancel order and restore stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update order status
      const cancelled = await tx.order.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' }
      });

      // 2. Restore stock for all items
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      return cancelled;
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByCustomer,
  cancelOrder
};
