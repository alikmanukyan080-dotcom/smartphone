const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility,
  duplicateProduct,
  addReview
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/visibility', protect, toggleVisibility);
router.post('/:id/duplicate', protect, duplicateProduct);
router.post('/:id/reviews', addReview);

module.exports = router;
