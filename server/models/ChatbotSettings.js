const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true }
  },
  { _id: true }
);

const chatbotSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    welcomeMessage: {
      type: String,
      default: "Hi! 👋 I'm the Nova Mobile assistant. Ask me about phones, prices, colors, storage, delivery, or your order."
    },
    quickQuestions: {
      type: [String],
      default: [
        'What is the cheapest phone?',
        'Which phones support 5G?',
        'What colors are available?',
        'How much is delivery?',
        'How do I order?'
      ]
    },
    faqs: { type: [faqSchema], default: [] },
    deliveryInfo: {
      type: String,
      default: 'Standard delivery takes 1-3 business days. Free delivery on orders over $200.'
    },
    storeInfo: {
      type: String,
      default: 'Nova Mobile is a premium smartphone retailer offering official warranty on every device.'
    }
  },
  { timestamps: true }
);

// Singleton pattern helper
chatbotSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('ChatbotSettings', chatbotSettingsSchema);
