const express = require('express');
const {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);
router.post('/', protect, createBrand);
router.put('/:id', protect, updateBrand);
router.delete('/:id', protect, deleteBrand);

module.exports = router;
