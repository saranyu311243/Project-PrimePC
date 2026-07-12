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

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get users', error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });

    res.json({ success: true, message: 'User role updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total, revenueAgg] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { totalAmount: true }
      })
    ]);

    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    res.json({
      success: true,
      data: {
        orders,
        totalOrders: total,
        totalRevenue,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sales report', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

module.exports = { getDashboard, getAllUsers, updateUserRole, getSalesReport, deleteUser };
