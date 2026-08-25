const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  sendOwnerOrderEmail,
  sendCustomerConfirmationEmail,
  sendStatusUpdateEmail
} = require('../services/emailService');

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({
    orderNumber: new RegExp(`^PH-${year}-`)
  });
  const next = String(count + 1).padStart(6, '0');
  return `PH-${year}-${next}`;
}

// POST /api/orders  (public)
async function createOrder(req, res, next) {
  try {
    const { customer, delivery, comment, items, paymentMethod } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.email) {
      return res.status(400).json({ message: 'Customer name, phone and email are required.' });
    }
    if (!delivery?.address || !delivery?.city) {
      return res.status(400).json({ message: 'Delivery address and city are required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    // Recompute prices server-side from DB (never trust client-submitted prices)
    const verifiedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      let price = product.price;
      let stockRef = null;
      if (item.storage && product.storageOptions?.length) {
        const variant = product.storageOptions.find((s) => s.capacity === item.storage);
        if (variant) {
          price = variant.price;
          stockRef = { type: 'storage', id: variant._id };
        }
      }

      let colorHex = '';
      let image = product.images?.[0] || '';
      if (item.color && product.colors?.length) {
        const colorVariant = product.colors.find((c) => c.name === item.color);
        if (colorVariant) {
          colorHex = colorVariant.hex;
          if (colorVariant.images?.length) image = colorVariant.images[0];
          if (!stockRef) stockRef = { type: 'color', id: colorVariant._id };
        }
      }

      verifiedItems.push({
        product: product._id,
        title: product.title,
        image,
        brand: item.brand || '',
        color: item.color || '',
        colorHex,
        storage: item.storage || '',
        price,
        quantity: Math.max(1, Number(item.quantity) || 1)
      });
    }

    const subtotal = verifiedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD) || 200;
    const flatFee = Number(process.env.DELIVERY_FEE) || 5.99;
    const deliveryFee = subtotal >= freeThreshold ? 0 : flatFee;
    const total = subtotal + deliveryFee;

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer,
      delivery,
      comment,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      statusHistory: [{ status: 'NEW' }]
    });

    // Decrement stock + bump soldCount (best-effort, non-blocking for response)
    for (const item of verifiedItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      if (item.storage) {
        const variant = product.storageOptions.find((s) => s.capacity === item.storage);
        if (variant) variant.stock = Math.max(0, variant.stock - item.quantity);
      }
      if (item.color) {
        const colorVariant = product.colors.find((c) => c.name === item.color);
        if (colorVariant) colorVariant.stock = Math.max(0, colorVariant.stock - item.quantity);
      }
      product.soldCount = (product.soldCount || 0) + item.quantity;
      await product.save();
    }

    // Fire off emails (do not block order creation on email failures)
    sendOwnerOrderEmail(order).catch((e) => console.error('Owner email failed:', e.message));
    sendCustomerConfirmationEmail(order).catch((e) =>
      console.error('Customer email failed:', e.message)
    );

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'customer.name': new RegExp(search, 'i') },
        { 'customer.phone': new RegExp(search, 'i') },
        { 'customer.email': new RegExp(search, 'i') }
      ];
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function getOrderByNumber(req, res, next) {
  try {
    const order = await Order.findOne({ orderNumber: req.params.number });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status, notifyCustomer } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    if (notifyCustomer) {
      sendStatusUpdateEmail(order).catch((e) =>
        console.error('Status update email failed:', e.message)
      );
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const [totalProducts, totalOrders, pending, completed, cancelled, lowStock, revenueAgg] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['NEW', 'CONFIRMED', 'PROCESSING', 'READY'] } }),
        Order.countDocuments({ status: 'DELIVERED' }),
        Order.countDocuments({ status: 'CANCELLED' }),
        Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
        Order.aggregate([
          { $match: { status: { $ne: 'CANCELLED' } } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
      ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8);
    const popularPhones = await Product.find().sort({ soldCount: -1 }).limit(6);

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders: pending,
      completedOrders: completed,
      cancelledOrders: cancelled,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStock,
      todaysOrders,
      recentOrders,
      popularPhones
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  getDashboardStats
};
