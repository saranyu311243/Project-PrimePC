const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');
const { parsePositiveInt } = require('../lib/validation');

// Valid payment methods
const validPaymentMethods = ['credit_card', 'bank_transfer', 'paypal', 'qr_code'];
const validPaymentStatuses = ['PENDING', 'SUCCESS', 'FAILED'];

const getPaymentOptions = (req, res) => {
  res.json({
    success: true,
    data: validPaymentMethods
  });
};

// Create payment with proper authorization and validation
const createPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId, amount, method, transactionId } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const orderIdInt = parsePositiveInt(orderId);
    if (orderIdInt === null) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!method || !validPaymentMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`
      });
    }

    // Get order with full details
    const order = await prisma.order.findUnique({
      where: { id: orderIdInt },
      include: {
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization: Check if this user owns the order
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create payment for your own orders'
      });
    }

    // Check if payment already exists — a FAILED payment is not in-flight or
    // completed, so it must not permanently block ever paying for this order
    // again. Clear it out (Payment.orderId is unique, so the old row has to
    // go before a new one can be created) and let the customer retry.
    if (order.payment) {
      if (order.payment.status !== 'FAILED') {
        return res.status(400).json({
          success: false,
          message: 'Payment already exists for this order'
        });
      }
      await prisma.payment.delete({ where: { id: order.payment.id } });
    }

    // Validate amount matches order total
    const orderAmount = parseFloat(order.totalAmount);
    const paymentAmount = parseFloat(amount);

    if (Math.abs(orderAmount - paymentAmount) > 0.01) { // tolerance for floating point
      return res.status(400).json({
        success: false,
        message: `Payment amount (${paymentAmount}) does not match order total (${orderAmount})`
      });
    }

    // Check order status
    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create payment for cancelled order'
      });
    }

    if (['PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid or in progress'
      });
    }

    // Create payment (status = PENDING by default, not SUCCESS)
    // Note: ในระบบจริงต้องเชื่อมต่อ payment gateway
    // แต่สำหรับส่งอาจารย์ เราจะตั้งเป็น PENDING แล้วให้ confirm ภายหลัง
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: paymentAmount,
        method,
        transactionId: transactionId || `TXN-${uuidv4()}`,
        status: 'PENDING'
      }
    });

    // Update order status to CONFIRMED (waiting for payment confirmation)
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully. Please confirm payment.',
      data: payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Get payment by order ID
const getPaymentByOrder = async (req, res) => {
  try {
    const orderId = parsePositiveInt(req.params.orderId);
    if (orderId === null) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            totalAmount: true,
            status: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order'
      });
    }

    // Authorization: Check if user owns this order
    if (req.user.role === 'CUSTOMER' && payment.order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Confirm payment (สำหรับ admin/staff หรือ webhook จาก payment gateway)
const confirmPayment = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid payment id' });
    }

    const { status = 'SUCCESS' } = req.body;

    // Validate status
    if (typeof status !== 'string' || !validPaymentStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    // Get payment with order
    const currentPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: true
      }
    });

    if (!currentPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Do not confirm payment for cancelled orders
    if (currentPayment.order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm payment for cancelled order'
      });
    }

    // Only PENDING payments can be confirmed
    if (currentPayment.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm payment with status: ${currentPayment.status}`
      });
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { id },
      data: { status }
    });

    // Update order status based on payment status
    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PROCESSING' }
      });
    } else if (status === 'FAILED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PENDING' }
      });
    }

    res.json({
      success: true,
      message: `Payment ${status.toLowerCase()}`,
      data: payment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

module.exports = {
  getPaymentOptions,
  createPayment,
  getPaymentByOrder,
  confirmPayment
};
