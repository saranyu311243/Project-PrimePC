const prisma = require('../lib/prisma');
const { parsePositiveInt, parsePagination } = require('../lib/validation');

// Validate order status enum
const validOrderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

// Forward-only order lifecycle. CANCELLED is reachable from any
// non-terminal state; nothing is reachable from a terminal state.
const ORDER_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Restores stock for every item in an order, inside the given transaction.
// Shared by cancelOrder and updateOrderStatus(->CANCELLED) so the two
// cancellation paths can never drift out of sync (one used to skip this).
async function restoreOrderStock(tx, orderId) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    });
  }
}

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
      const productId = parsePositiveInt(item.productId);
      if (productId === null) {
        return res.status(400).json({
          success: false,
          message: `Invalid productId: ${item.productId}`
        });
      }

      if (item.quantity === undefined || item.quantity === null || item.quantity === '') {
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId and quantity'
        });
      }

      // Strict integer check — a fractional string like "2.9" must be
      // rejected, not silently floored to 2 (that would silently bill/reserve
      // less than what parseInt-truncation implied to the client).
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive integer'
        });
      }

      // ดึงข้อมูลสินค้าจริงจาก database
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      // ตรวจสอบว่าสินค้ามีอยู่จริง
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ID ${productId} not found`
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

        // ลด stock แบบ atomic: ตัดเฉพาะเมื่อ stock ยังพอ (กัน race ขายเกิน)
        const decremented = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });

        // ถ้าไม่มีแถวถูกอัปเดต แสดงว่ามีคนตัด stock ไปก่อนจน stock ไม่พอ
        if (decremented.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.product.name}`);
        }
      }

      // 3. ล้างเฉพาะรายการที่สั่งซื้อออกจากตะกร้า (ไม่แตะสินค้าอื่นที่ยังไม่ได้สั่ง)
      const cart = await tx.cart.findFirst({ where: { userId: parseInt(userId) } });
      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id, productId: { in: validatedItems.map((i) => i.productId) } }
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

    // stock ถูกตัดไปก่อนระหว่างสั่งซื้อพร้อมกัน → แจ้งเป็น 400
    if (error.message && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      const productName = error.message.split(':')[1];
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${productName}" — please try again`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Get all orders or user's orders
const getAllOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    let where = {};
    if (req.user && req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    } else if (req.query.userId) {
      const filterUserId = parsePositiveInt(req.query.userId);
      if (filterUserId === null) {
        return res.status(400).json({ success: false, message: 'Invalid userId' });
      }
      where.userId = filterUserId;
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
        skip,
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

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
      where: { id }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Business logic: only allow legal forward transitions (also covers the
    // old "cannot update a cancelled order" rule, since CANCELLED has no
    // allowed next states).
    const allowedNext = ORDER_STATUS_TRANSITIONS[currentOrder.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition order from ${currentOrder.status} to ${status}`
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status }
      });

      // Cancelling via this endpoint must restore stock exactly like the
      // dedicated /cancel endpoint does — otherwise inventory silently leaks.
      if (status === 'CANCELLED') {
        await restoreOrderStock(tx, id);
      }

      return updated;
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

const getOrdersByCustomer = async (req, res) => {
  try {
    const customerId = parsePositiveInt(req.params.id);
    if (customerId === null) {
      return res.status(400).json({ success: false, message: 'Invalid customer id' });
    }

    // Access control: customers can only view their own orders.
    // Staff/admin may view any customer's orders.
    if (req.user && req.user.role === 'CUSTOMER' && req.user.id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const orders = await prisma.order.findMany({
      where: { userId: customerId },
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Cancel order with stock restoration
const cancelOrder = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id },
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
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // 2. Restore stock for all items
      await restoreOrderStock(tx, id);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
