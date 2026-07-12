const prisma = require('../lib/prisma');

const getPaymentOptions = (req, res) => {
  res.json({ success: true, data: ['credit_card', 'bank_transfer', 'paypal'] });
};

const createPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId, amount, method, transactionId } = req.body;
    if (!orderId || !amount) return res.status(400).json({ success: false, message: 'orderId and amount required' });

    // ensure order exists
    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: parseFloat(amount),
        method,
        transactionId,
        status: 'SUCCESS'
      }
    });

    // update order status to PAID
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create payment', error: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'SUCCESS' } = req.body;

    const payment = await prisma.payment.update({ where: { id: parseInt(id) }, data: { status } });

    if (status === 'SUCCESS') {
      await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'PAID' } });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to confirm payment', error: error.message });
  }
};

module.exports = { getPaymentOptions, createPayment, confirmPayment };
