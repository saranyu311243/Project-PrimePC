const prisma = require('../lib/prisma');

// Create order
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { items = [], shippingAddress, totalAmount } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'User ID required' });

    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        totalAmount: parseFloat(totalAmount) || 0,
        shippingAddress,
      }
    });

    // create order items
    const orderItems = await Promise.all(items.map(it =>
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: parseInt(it.productId),
          quantity: parseInt(it.quantity),
          price: parseFloat(it.price)
        }
      })
    ));

    res.status(201).json({ success: true, data: { order, items: orderItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

// Get all orders or user's orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let where = {};
    if (req.user && req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    } else if (req.query.userId) {
      where.userId = parseInt(req.query.userId);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, include: { orderItems: true, payment: true, shipment: true }, skip: parseInt(skip), take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where })
    ]);

    res.json({ success: true, data: orders, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get orders', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) }, include: { orderItems: true, payment: true, shipment: true } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // simple access control: customers can only view their orders
    if (req.user && req.user.role === 'CUSTOMER' && req.user.id !== order.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get order', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({ where: { id: parseInt(id) }, data: { status } });

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

const getOrdersByCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await prisma.order.findMany({ where: { userId: parseInt(id) }, include: { orderItems: true } });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get customer orders', error: error.message });
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, getOrdersByCustomer };
