const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  getDashboardStats,
  deleteOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const router = express.Router();
 
router.post('/', createOrder);
router.get('/', protect, getOrders);
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/track/:number', getOrderByNumber);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);
 
module.exports = router;
