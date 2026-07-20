const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const { parsePositiveInt, parsePagination, parseOptionalDate } = require('../lib/validation');

// รายได้จริงนับเฉพาะออเดอร์ที่ผ่านการชำระเงินแล้ว (ไม่รวม PENDING/CANCELLED)
const REVENUE_STATUSES = ['PROCESSING', 'SHIPPING', 'DELIVERED'];

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalOrders, revenueAgg, pendingOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: REVENUE_STATUSES } },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({ where: { status: 'PENDING' } })
    ]);
    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    res.json({ success: true, data: { totalUsers, totalOrders, totalRevenue, pendingOrders } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get dashboard', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) });
  }
};

// Get all users
// เห็นเฉพาะ STAFF/ADMIN เท่านั้น — ไม่โชว์ลูกค้า (CUSTOMER) ในหน้าจัดการผู้ใช้ของแอดมิน
const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { role: { in: ['STAFF', 'ADMIN'] } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get users', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) });
  }
};

// Update user role
// แอดมินแก้ยศ staff ได้ แต่แก้ยศ admin คนอื่น (หรือตัวเอง) ผ่าน endpoint นี้ไม่ได้
const updateUserRole = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const { role } = req.body;

    if (!['CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Atomic conditional update — the role check and the write happen in a single
    // SQL statement, so a concurrent promotion to ADMIN can't slip through between
    // a separate read-then-write (TOCTOU race).
    const { count } = await prisma.user.updateMany({
      where: { id, role: { not: 'ADMIN' } },
      data: { role }
    });

    if (count === 0) {
      const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(403).json({ success: false, message: 'Cannot change another admin\'s role' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true }
    });

    res.json({ success: true, message: 'User role updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) });
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 50 });

    const startDate = parseOptionalDate(req.query.startDate);
    const endDate = parseOptionalDate(req.query.endDate);
    if (startDate === null || endDate === null) {
      return res.status(400).json({ success: false, message: 'Invalid startDate or endDate' });
    }

    const where = {};
    if (startDate !== undefined || endDate !== undefined) {
      where.createdAt = {};
      if (startDate !== undefined) where.createdAt.gte = startDate;
      if (endDate !== undefined) where.createdAt.lte = endDate;
    }

    const [orders, total, revenueAgg] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: { in: REVENUE_STATUSES } },
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
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sales report', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) });
  }
};

// Delete user
// เหมือน updateUserRole — แอดมินลบ staff ได้ แต่ลบ admin คนอื่น (หรือตัวเอง) ไม่ได้
const deleteUser = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    // Prevent deleting yourself
    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    // Atomic conditional delete — same TOCTOU-safe pattern as updateUserRole,
    // so a concurrent promotion to ADMIN can't slip through between a
    // separate read-then-delete.
    const { count } = await prisma.user.deleteMany({ where: { id, role: { not: 'ADMIN' } } });

    if (count === 0) {
      const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(403).json({ success: false, message: 'Cannot delete another admin' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) });
  }
};

// Create a new STAFF account
// role ถูกบังคับเป็น STAFF เสมอผ่าน endpoint นี้ — ห้ามให้แอดมินสร้างบัญชี ADMIN
// โดยตรงจากตรงนี้ (ถ้าจะเลื่อนขั้นต้องผ่าน updateUserRole ซึ่งมีการล็อกแยกต่างหากอยู่แล้ว)
const createStaff = async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone, address, role: 'STAFF' },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, createdAt: true }
    });

    res.status(201).json({ success: true, message: 'Staff account created successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create staff account', ...(process.env.NODE_ENV !== 'production' && { error: error.message }) });
  }
};

module.exports = { getDashboard, getAllUsers, updateUserRole, getSalesReport, deleteUser, createStaff };
