require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ChatbotSettings = require('../models/ChatbotSettings');

const IMG = (seed) => `https://picsum.photos/seed/${seed}/800/900`;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding...');

  await Promise.all([Brand.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  const brandNames = ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Honor', 'Nothing', 'Motorola'];
  const brands = {};
  for (const [i, name] of brandNames.entries()) {
    brands[name] = await Brand.create({
      name,
      description: `${name} smartphones`,
      isFeatured: i < 6,
      order: i
    });
  }

  const categoryNames = ['Flagships', 'Budget Phones', 'Gaming Phones', '5G Phones', 'Foldables'];
  const categories = {};
  for (const name of categoryNames) {
    categories[name] = await Category.create({ name, description: `${name} category` });
  }

  const products = [
    {
      brand: brands['Apple']._id,
      category: categories['Flagships']._id,
      model: 'iPhone 17 Pro',
      title: 'Apple iPhone 17 Pro',
      description: 'The most powerful iPhone yet, with a titanium design and pro camera system.',
      images: [IMG('iphone17pro-1'), IMG('iphone17pro-2')],
      colors: [
        { name: 'Natural Titanium', hex: '#8A8A82', images: [IMG('iphone-natural-1'), IMG('iphone-natural-2')], stock: 12, sku: 'IP17P-NT' },
        { name: 'Desert Titanium', hex: '#C7A97B', images: [IMG('iphone-desert-1'), IMG('iphone-desert-2')], stock: 8, sku: 'IP17P-DT' },
        { name: 'Black Titanium', hex: '#1B1B1D', images: [IMG('iphone-black-1'), IMG('iphone-black-2')], stock: 15, sku: 'IP17P-BK' }
      ],
      storageOptions: [
        { capacity: '256GB', price: 1199, oldPrice: 1299, stock: 20, sku: 'IP17P-256' },
        { capacity: '512GB', price: 1399, stock: 10, sku: 'IP17P-512' },
        { capacity: '1TB', price: 1599, stock: 5, sku: 'IP17P-1TB' }
      ],
      price: 1199,
      oldPrice: 1299,
      ram: ['8GB'],
      processor: 'Apple A19 Pro',
      display: '6.3" Super Retina XDR OLED, 120Hz',
      camera: '48MP Triple Camera System',
      battery: '4200mAh',
      os: 'iOS 19',
      is5G: true,
      simType: 'Dual SIM (eSIM)',
      warranty: '1 Year',
      dimensions: '146.6 x 70.6 x 8.25 mm',
      weight: '199g',
      tags: ['flagship', 'apple', 'titanium', 'pro'],
      badges: ['NEW', 'FEATURED'],
      isFeatured: true
    },
    {
      brand: brands['Samsung']._id,
      category: categories['Flagships']._id,
      model: 'Galaxy S26 Ultra',
      title: 'Samsung Galaxy S26 Ultra',
      description: 'Ultra performance with S Pen, a 200MP camera, and a stunning AMOLED display.',
      images: [IMG('s26ultra-1'), IMG('s26ultra-2')],
      colors: [
        { name: 'Titanium Black', hex: '#1A1A1A', images: [IMG('s26-black-1')], stock: 14, sku: 'S26U-BK' },
        { name: 'Titanium Violet', hex: '#8E7CC3', images: [IMG('s26-violet-1')], stock: 9, sku: 'S26U-VI' },
        { name: 'Titanium Silver', hex: '#C7C9CB', images: [IMG('s26-silver-1')], stock: 11, sku: 'S26U-SI' }
      ],
      storageOptions: [
        { capacity: '256GB', price: 1299, stock: 18, sku: 'S26U-256' },
        { capacity: '512GB', price: 1499, oldPrice: 1599, stock: 12, sku: 'S26U-512' }
      ],
      price: 1299,
      ram: ['12GB'],
      processor: 'Snapdragon 8 Gen 5',
      display: '6.9" Dynamic AMOLED 2X, 120Hz',
      camera: '200MP Quad Camera with S Pen',
      battery: '5100mAh',
      os: 'Android 16 / One UI 8',
      is5G: true,
      simType: 'Dual SIM',
      warranty: '2 Years',
      dimensions: '162.3 x 79.0 x 8.6 mm',
      weight: '234g',
      tags: ['flagship', 'samsung', 'ultra', 's-pen'],
      badges: ['SALE', 'POPULAR'],
      isFeatured: true
    },
    {
      brand: brands['Xiaomi']._id,
      category: categories['Budget Phones']._id,
      model: 'Redmi Note 15 Pro',
      title: 'Xiaomi Redmi Note 15 Pro',
      description: 'Excellent value with a large AMOLED display and fast charging.',
      images: [IMG('redmi15-1')],
      colors: [
        { name: 'Midnight Black', hex: '#111111', images: [IMG('redmi-black')], stock: 30, sku: 'RN15-BK' },
        { name: 'Ocean Blue', hex: '#2E5EAA', images: [IMG('redmi-blue')], stock: 22, sku: 'RN15-BL' },
        { name: 'Forest Green', hex: '#3A6B4C', images: [IMG('redmi-green')], stock: 17, sku: 'RN15-GR' }
      ],
      storageOptions: [
        { capacity: '128GB', price: 279, stock: 40, sku: 'RN15-128' },
        { capacity: '256GB', price: 329, stock: 25, sku: 'RN15-256' }
      ],
      price: 279,
      ram: ['6GB', '8GB'],
      processor: 'Snapdragon 7s Gen 3',
      display: '6.7" AMOLED, 120Hz',
      camera: '108MP Main Camera',
      battery: '5500mAh, 90W charging',
      os: 'Android 15 / HyperOS',
      is5G: true,
      simType: 'Dual SIM',
      warranty: '1 Year',
      tags: ['budget', 'xiaomi', 'value'],
      badges: ['BEST_SELLER'],
      isFeatured: true
    },
    {
      brand: brands['Google']._id,
      category: categories['Flagships']._id,
      model: 'Pixel 10 Pro',
      title: 'Google Pixel 10 Pro',
      description: 'Pure Android experience with the best computational photography around.',
      images: [IMG('pixel10-1')],
      colors: [
        { name: 'Obsidian', hex: '#1C1C1E', images: [IMG('pixel-obsidian')], stock: 10, sku: 'P10P-OB' },
        { name: 'Porcelain', hex: '#EDEAE3', images: [IMG('pixel-porcelain')], stock: 8, sku: 'P10P-PO' }
      ],
      storageOptions: [
        { capacity: '128GB', price: 999, stock: 15, sku: 'P10P-128' },
        { capacity: '256GB', price: 1099, stock: 9, sku: 'P10P-256' }
      ],
      price: 999,
      ram: ['16GB'],
      processor: 'Google Tensor G5',
      display: '6.7" LTPO OLED, 120Hz',
      camera: '50MP Pro Camera System',
      battery: '5000mAh',
      os: 'Android 16',
      is5G: true,
      simType: 'Dual SIM (eSIM)',
      warranty: '1 Year',
      tags: ['pixel', 'google', 'camera', 'flagship'],
      badges: ['NEW'],
      isFeatured: true
    },
    {
      brand: brands['OnePlus']._id,
      category: categories['Gaming Phones']._id,
      model: 'OnePlus 14',
      title: 'OnePlus 14',
      description: 'Blazing performance and ultra-fast charging for power users and gamers.',
      images: [IMG('oneplus14-1')],
      colors: [
        { name: 'Sandstone Black', hex: '#2B2B2B', images: [IMG('op-black')], stock: 20, sku: 'OP14-BK' },
        { name: 'Emerald Green', hex: '#0F6B4C', images: [IMG('op-green')], stock: 13, sku: 'OP14-GR' }
      ],
      storageOptions: [
        { capacity: '256GB', price: 799, stock: 22, sku: 'OP14-256' },
        { capacity: '512GB', price: 899, stock: 14, sku: 'OP14-512' }
      ],
      price: 799,
      ram: ['12GB', '16GB'],
      processor: 'Snapdragon 8 Gen 5',
      display: '6.8" AMOLED, 144Hz',
      camera: '50MP Hasselblad Camera',
      battery: '5400mAh, 100W SuperVOOC',
      os: 'Android 16 / OxygenOS',
      is5G: true,
      simType: 'Dual SIM',
      warranty: '1 Year',
      tags: ['gaming', 'oneplus', 'fast-charging'],
      badges: ['POPULAR'],
      isFeatured: false
    },
    {
      brand: brands['Nothing']._id,
      category: categories['5G Phones']._id,
      model: 'Nothing Phone (4)',
      title: 'Nothing Phone (4)',
      description: 'Distinctive transparent design with the signature Glyph Interface.',
      images: [IMG('nothing4-1')],
      colors: [
        { name: 'White', hex: '#F2F2F0', images: [IMG('nothing-white')], stock: 16, sku: 'NP4-WH' },
        { name: 'Black', hex: '#0D0D0D', images: [IMG('nothing-black')], stock: 19, sku: 'NP4-BK' }
      ],
      storageOptions: [{ capacity: '256GB', price: 599, stock: 24, sku: 'NP4-256' }],
      price: 599,
      ram: ['12GB'],
      processor: 'Snapdragon 8s Gen 4',
      display: '6.7" AMOLED, 120Hz',
      camera: '50MP Dual Camera',
      battery: '5000mAh',
      os: 'Android 16 / Nothing OS',
      is5G: true,
      simType: 'Dual SIM',
      warranty: '1 Year',
      tags: ['design', 'nothing', 'unique'],
      badges: ['LIMITED'],
      isFeatured: false
    }
  ];

  await Product.insertMany(products);
  await ChatbotSettings.getSettings();

  console.log(`Seeded ${brandNames.length} brands, ${categoryNames.length} categories, ${products.length} products.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
