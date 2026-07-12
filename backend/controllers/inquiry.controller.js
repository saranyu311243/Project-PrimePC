const prisma = require('../lib/prisma');

const createInquiry = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { message } = req.body;
    if (!userId || !message) return res.status(400).json({ success: false, message: 'userId and message required' });

    const inquiry = await prisma.inquiry.create({ data: { userId: parseInt(userId), message } });
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create inquiry', error: error.message });
  }
};

const getInquiries = async (req, res) => {
  try {
    const where = {};
    if (req.user && req.user.role === 'CUSTOMER') where.userId = req.user.id;

    const inquiries = await prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get inquiries', error: error.message });
  }
};

const respondInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const inquiry = await prisma.inquiry.update({ where: { id: parseInt(id) }, data: { response, status: 'RESPONDED' } });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to respond to inquiry', error: error.message });
  }
};

module.exports = { createInquiry, getInquiries, respondInquiry };
