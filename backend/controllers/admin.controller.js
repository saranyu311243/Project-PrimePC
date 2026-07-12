const prisma = require('../lib/prisma');

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const revenueAgg = await prisma.order.aggregate({ _sum: { totalAmount: true } });
    const totalRevenue = revenueAgg._sum.totalAmount || 0;
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });

    res.json({ success: true, data: { totalUsers, totalOrders, totalRevenue, pendingOrders } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get dashboard', error: error.message });
  }
};

module.exports = { getDashboard };
