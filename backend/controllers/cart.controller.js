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

    // คำนวณยอดรวม
    const totalAmount = cart.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        ...cart,
        totalAmount
      }
    });
  } catch (error) {
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
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
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
      // เพิ่มจำนวนถ้ามีอยู่แล้ว
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + parseInt(quantity)
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
          quantity: parseInt(quantity)
        },
        include: {
          product: true
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cartItem
    });
  } catch (error) {
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

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
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

    // ตรวจสอบ stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) },
      include: {
        product: true
      }
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      data: updatedItem
    });
  } catch (error) {
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
      message: 'Item removed from cart'
    });
  } catch (error) {
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
      message: 'Cart cleared'
    });
  } catch (error) {
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
