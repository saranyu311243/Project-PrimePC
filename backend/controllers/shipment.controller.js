const prisma = require('../lib/prisma');

// Valid shipment statuses
const validShipmentStatuses = ['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

// Create shipment (Staff/Admin only)
const createShipment = async (req, res) => {
  try {
    const { orderId, trackingNumber } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        shipment: true,
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if shipment already exists
    if (order.shipment) {
      return res.status(400).json({
        success: false,
        message: 'Shipment already exists for this order'
      });
    }

    // Check if order is paid (must have payment with SUCCESS status)
    if (!order.payment || order.payment.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Order must be paid before creating shipment'
      });
    }

    // Check order status
    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create shipment for cancelled order'
      });
    }

    if (!['PROCESSING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order must be in PROCESSING or CONFIRMED status'
      });
    }

    // Create shipment and update order status
    const shipment = await prisma.$transaction(async (tx) => {
      const newShipment = await tx.shipment.create({
        data: {
          orderId: parseInt(orderId),
          trackingNumber: trackingNumber || `TRACK-${Date.now()}`,
          status: 'PREPARING'
        }
      });

      // Update order status to SHIPPING
      await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { status: 'SHIPPING' }
      });

      return newShipment;
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Update shipment status (Staff/Admin only)
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !validShipmentStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validShipmentStatuses.join(', ')}`
      });
    }

    // Get current shipment
    const currentShipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: true
      }
    });

    if (!currentShipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Business logic: cannot update cancelled shipment
    if (currentShipment.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update cancelled shipment'
      });
    }

    // Prepare update data
    const data = { status };
    if (status === 'SHIPPED') {
      data.shippedAt = new Date();
    }
    if (status === 'DELIVERED') {
      data.deliveredAt = new Date();
    }

    // Update shipment and sync order status
    const result = await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.update({
        where: { id: parseInt(id) },
        data
      });

      // Sync order status based on shipment status
      let orderStatus = currentShipment.order.status;
      if (status === 'SHIPPED' || status === 'IN_TRANSIT') {
        orderStatus = 'SHIPPING';
      } else if (status === 'DELIVERED') {
        orderStatus = 'DELIVERED';
      } else if (status === 'CANCELLED') {
        orderStatus = 'CANCELLED';
      }

      await tx.order.update({
        where: { id: shipment.orderId },
        data: { status: orderStatus }
      });

      return shipment;
    });

    res.json({
      success: true,
      message: 'Shipment status updated',
      data: result
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipment',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Get shipment by order ID
const getShipmentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { orderId: parseInt(orderId) },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            totalAmount: true,
            status: true,
            shippingAddress: true
          }
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Authorization: Customer can only view their own order's shipment
    if (req.user.role === 'CUSTOMER' && shipment.order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shipment',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// Get all shipments (Staff/Admin only)
const getAllShipments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && validShipmentStatuses.includes(status)) {
      where.status = status;
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: {
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
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shipment.count({ where })
    ]);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shipments',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

module.exports = {
  createShipment,
  updateShipmentStatus,
  getShipmentByOrderId,
  getAllShipments
};
