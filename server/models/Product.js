const mongoose = require('mongoose');
const slugify = require('slugify');

const colorVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Natural Titanium"
    hex: { type: String, required: true, trim: true }, // e.g. "#8A8A82"
    images: { type: [String], default: [] }, // image URLs for this color
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true }
  },
  { _id: true }
);

const storageVariantSchema = new mongoose.Schema(
  {
    capacity: { type: String, required: true, trim: true }, // e.g. "256GB"
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true }
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    approved: { type: Boolean, default: true }
  },
  { _id: true }
);

const BADGE_VALUES = ['NEW', 'SALE', 'POPULAR', 'BEST_SELLER', 'LIMITED', 'FEATURED'];

const productSchema = new mongoose.Schema(
  {
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    model: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: '' },

    images: { type: [String], default: [] }, // default gallery (fallback when no color selected)

    // Base display price (derived from cheapest storage variant, kept for quick sort/filter)
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, default: 0 },

    colors: { type: [colorVariantSchema], default: [] },
    storageOptions: { type: [storageVariantSchema], default: [] },

    ram: [{ type: String }], // e.g. ["8GB", "12GB"]
    processor: { type: String },
    display: { type: String },
    camera: { type: String },
    battery: { type: String },
    os: { type: String },
    is5G: { type: Boolean, default: false },
    simType: { type: String, default: 'Dual SIM' },
    warranty: { type: String, default: '1 Year' },
    dimensions: { type: String },
    weight: { type: String },

    stock: { type: Number, default: 0, min: 0 }, // aggregate stock (auto-computed)
    sku: { type: String, unique: true, sparse: true, trim: true },
    tags: { type: [String], default: [] },
    badges: { type: [String], enum: BADGE_VALUES, default: [] },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },

    isActive: { type: Boolean, default: true }, // show/hide
    isFeatured: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', model: 'text', description: 'text', tags: 'text', sku: 'text' });

productSchema.pre('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(`${this.title}-${this._id || Math.random().toString(36).slice(2, 7)}`, {
      lower: true,
      strict: true
    });
  }
  next();
});

productSchema.pre('save', function (next) {
  // Recompute aggregate stock from variants when present
  if (this.storageOptions && this.storageOptions.length > 0) {
    this.stock = this.storageOptions.reduce((sum, s) => sum + (s.stock || 0), 0);
    const cheapest = [...this.storageOptions].sort((a, b) => a.price - b.price)[0];
    if (cheapest) {
      this.price = cheapest.price;
      if (cheapest.oldPrice) this.oldPrice = cheapest.oldPrice;
    }
  } else if (this.colors && this.colors.length > 0) {
    this.stock = this.colors.reduce((sum, c) => sum + (c.stock || 0), 0);
  }

  if (this.oldPrice && this.oldPrice > this.price) {
    this.discountPercent = Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  } else {
    this.discountPercent = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
module.exports.BADGE_VALUES = BADGE_VALUES;
