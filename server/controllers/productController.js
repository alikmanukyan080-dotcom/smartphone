const Product = require('../models/Product');
const Brand = require('../models/Brand');

// GET /api/products  (public: only active; admin: all via ?all=true handled in route)
async function getProducts(req, res, next) {
  try {
    const {
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      storage,
      ram,
      color,
      os,
      is5G,
      inStock,
      sort,
      page = 1,
      limit = 24,
      all
    } = req.query;

    const filter = {};
    if (!all) filter.isActive = true;

    if (search) {
      filter.$text = { $search: search };
    }
    if (brand) {
      const brandDoc = await Brand.findOne({ slug: brand });
      if (brandDoc) filter.brand = brandDoc._id;
      else filter.brand = brand; // allow raw id too
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (storage) filter['storageOptions.capacity'] = storage;
    if (ram) filter.ram = ram;
    if (color) filter['colors.name'] = new RegExp(`^${color}$`, 'i');
    if (os) filter.os = new RegExp(os, 'i');
    if (is5G === 'true') filter.is5G = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'popularity':
        sortOption = { soldCount: -1 };
        break;
      case 'discount':
        sortOption = { discountPercent: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(60, Number(limit));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1
    });
  } catch (err) {
    next(err);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Related products: same brand or category, excluding self
    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [{ brand: product.brand }, { category: product.category }]
    })
      .limit(8)
      .populate('brand', 'name slug');

    res.json({ product, related });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name slug')
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

async function toggleVisibility(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function duplicateProduct(req, res, next) {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Product not found' });
    delete original._id;
    delete original.slug;
    delete original.sku;
    original.title = `${original.title} (Copy)`;
    original.isActive = false;
    const copy = await Product.create(original);
    res.status(201).json(copy);
  } catch (err) {
    next(err);
  }
}

async function addReview(req, res, next) {
  try {
    const { name, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.reviews.push({ name, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility,
  duplicateProduct,
  addReview
};
