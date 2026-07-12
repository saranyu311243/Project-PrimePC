const prisma = require('../lib/prisma');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true
          }
        }
      }
    });

    // สร้าง cart ใหม่ถ้ายังไม่มี
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          cartItems: {
            include: {
              product: true
            }
          }
        }
      });
    }

    // คำนวณยอดรวมและตรวจสอบ availability
    let totalAmount = 0;
    const items = [];

    for (const item of cart.cartItems) {
      const product = item.product;

      // เพิ่มข้อมูลความพร้อมของสินค้า
      const itemData = {
        ...item,
        product: {
          ...product,
          stockAvailable: product.stock >= item.quantity,
          isCurrentlyAvailable: product.isAvailable && product.stock >= item.quantity
        }
      };

      items.push(itemData);

      // คำนวณยอดรวมเฉพาะสินค้าที่พร้อมขาย
      if (product.isAvailable && product.stock >= item.quantity) {
        totalAmount += product.price * item.quantity;
      }
    }

    res.json({
      success: true,
      data: {
        ...cart,
        cartItems: items,
        totalAmount,
        hasUnavailableItems: items.some(i => !i.product.isCurrentlyAvailable)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required'
      });
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    if (parsedQuantity > 100) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot exceed 100 per item'
      });
    }

    // ตรวจสอบว่าสินค้ามีอยู่จริง
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available for purchase'
      });
    }

    if (product.stock < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${parsedQuantity}`
      });
    }

    // หา cart ของผู้ใช้
    let cart = await prisma.cart.findFirst({
      where: { userId }
    });

    // สร้าง cart ใหม่ถ้ายังไม่มี
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // ตรวจสอบว่ามีสินค้าในตะกร้าแล้วหรือไม่
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId)
        }
      }
    });

    let cartItem;

    if (existingItem) {
      const newQuantity = existingItem.quantity + parsedQuantity;

      // ตรวจสอบ stock อีกครั้งหลังบวกจำนวน
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${parsedQuantity} more. You already have ${existingItem.quantity} in cart. Available: ${product.stock}`
        });
      }

      if (newQuantity > 100) {
        return res.status(400).json({
          success: false,
          message: 'Total quantity in cart cannot exceed 100 per item'
        });
      }

      // เพิ่มจำนวนถ้ามีอยู่แล้ว
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: newQuantity
        },
        include: {
          product: true
        }
      });
    } else {
      // สร้างรายการใหม่
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parsedQuantity
        },
        include: {
          product: true
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validation
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    if (parsedQuantity > 100) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot exceed 100'
      });
    }

    // ตรวจสอบว่า item นี้เป็นของ user หรือไม่
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cart: {
          userId
        }
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // ตรวจสอบว่าสินค้ายังพร้อมขาย
    if (!cartItem.product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    // ตรวจสอบ stock
    if (cartItem.product.stock < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${parsedQuantity}`
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parsedQuantity },
      include: {
        product: true
      }
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // ตรวจสอบว่า item นี้เป็นของ user หรือไม่
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cart: {
          userId
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findFirst({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
