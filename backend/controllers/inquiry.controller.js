const prisma = require('../lib/prisma');

// Valid inquiry statuses
const validInquiryStatuses = ['PENDING', 'RESPONDED', 'CLOSED'];

// Create inquiry
const createInquiry = async (req, res) => {
  try {
    const userId = req.user?.id; // ใช้ req.user.id เท่านั้น (จาก token)
    const { message } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long (max 1000 characters)'
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: userId,
        message: message.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inquiry',
      error: error.message
    });
  }
};

// Get inquiries (Customer sees only their own, Staff/Admin sees all)
const getInquiries = async (req, res) => {
  try {
    const where = {};

    // Customer can only see their own inquiries
    if (req.user && req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiries',
      error: error.message
    });
  }
};

// Get inquiry by ID
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: parseInt(id) },
      include: {
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

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Authorization: Customer can only view their own inquiry
    if (req.user.role === 'CUSTOMER' && inquiry.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiry',
      error: error.message
    });
  }
};

// Get all inquiries (Staff/Admin only)
const getAllInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && validInquiryStatuses.includes(status)) {
      where.status = status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inquiry.count({ where })
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiries',
      error: error.message
    });
  }
};

// Respond to inquiry (Staff/Admin only)
const respondInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Response is required'
      });
    }

    if (response.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Response is too long (max 2000 characters)'
      });
    }

    const currentInquiry = await prisma.inquiry.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentInquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (currentInquiry.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot respond to closed inquiry'
      });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: parseInt(id) },
      data: {
        response: response.trim(),
        status: 'RESPONDED'
      }
    });

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Respond inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to inquiry',
      error: error.message
    });
  }
};

// Close inquiry (Staff/Admin only)
const closeInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const currentInquiry = await prisma.inquiry.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentInquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (currentInquiry.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Inquiry is already closed'
      });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: parseInt(id) },
      data: { status: 'CLOSED' }
    });

    res.json({
      success: true,
      message: 'Inquiry closed successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Close inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close inquiry',
      error: error.message
    });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  getAllInquiries,
  respondInquiry,
  closeInquiry
};
