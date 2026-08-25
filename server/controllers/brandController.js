const Brand = require('../models/Brand');
const Product = require('../models/Product');

async function getBrands(req, res, next) {
  try {
    const filter = req.query.all ? {} : { isActive: true };
    const brands = await Brand.find(filter).sort({ order: 1, name: 1 });
    res.json(brands);
  } catch (err) {
    next(err);
  }
}

async function getBrandBySlug(req, res, next) {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    next(err);
  }
}

async function createBrand(req, res, next) {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
}

async function updateBrand(req, res, next) {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    next(err);
  }
}

async function deleteBrand(req, res, next) {
  try {
    const inUse = await Product.countDocuments({ brand: req.params.id });
    if (inUse > 0) {
      return res
        .status(400)
        .json({ message: `Cannot delete brand: ${inUse} product(s) still use it. Hide it instead.` });
    }
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand };
