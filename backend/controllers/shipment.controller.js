const prisma = require('../lib/prisma');

const createShipment = async (req, res) => {
  try {
    const { orderId, trackingNumber } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId required' });

    const shipment = await prisma.shipment.create({
      data: {
        orderId: parseInt(orderId),
        trackingNumber,
        status: 'PREPARING'
      }
    });

    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create shipment', error: error.message });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const data = { status };
    if (status === 'SHIPPED') data.shippedAt = new Date();
    if (status === 'DELIVERED') data.deliveredAt = new Date();

    const shipment = await prisma.shipment.update({ where: { id: parseInt(id) }, data });

    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update shipment', error: error.message });
  }
};

const getShipmentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const shipment = await prisma.shipment.findUnique({ where: { orderId: parseInt(orderId) } });
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get shipment', error: error.message });
  }
};

module.exports = { createShipment, updateShipmentStatus, getShipmentByOrderId };
