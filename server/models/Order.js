const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String },
    brand: { type: String },
    color: { type: String },
    colorHex: { type: String },
    storage: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const STATUS_VALUES = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true }
    },
    delivery: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      date: { type: String },
      time: { type: String }
    },
    comment: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: STATUS_VALUES, default: 'NEW' },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: STATUS_VALUES },
          changedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    paymentMethod: { type: String, default: 'Cash on Delivery' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUS_VALUES = STATUS_VALUES;
