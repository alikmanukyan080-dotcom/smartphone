const Product = require('../models/Product');
const Brand = require('../models/Brand');
const ChatbotSettings = require('../models/ChatbotSettings');
const Order = require('../models/Order');

const REPLIES = {
  hy: {
    disabled: 'Չաթը ժամանակավորապես անհասանելի է։',
    askOrderNumber: 'Տրամադրեք պատվերի համարը (PH-2026-000123 ձևաչափ)։',
    orderStatus: (n,s,t) => `Պատվեր ${n}-ի կարգավիճակը՝ ${s}։ Ընդամենը՝ $${t}։`,
    orderNotFound: (n) => `${n} համարով պատվեր չի գտնվել։`,
    howToOrder: 'Բացեք հեռախոս, ընտրեք գույն ու հիշողություն, սեղմեք "Ավելացնել զամբյուղ"։',
    cheapestFound: (p) => `Ամենամատչելի հեռախոսները սկսվում են $${p}-ից։`,
    cheapestNone: 'Պահեստում հեռախոսներ չկան։',
    fiveGFound: (n) => `Ահա ${n} հատ 5G հեռախոս։`,
    fiveGNone: '5G հեռախոսներ ցուցակում չկան։',
    camera: 'Սրանք ամենաբարձր գնահատված հեռախոսներն են՝ ամենալավ տեսախցիկներով։',
    colorsFound: (l) => `Հասանելի գույներ՝ ${l}։`,
    colorsNone: 'Գույների ընտրությունը կախված է մոդելից։',
    storageFound: (l) => `Հիշողության տարբերակներ՝ ${l}։`,
    storageNone: 'Հիշողության ընտրությունը կախված է մոդելից։',
    brandFound: (n) => `Ահա ${n} հեռախոսները։`,
    brandNone: (n) => `${n} հեռախոսներ այս պահին չկան։`,
    samplePhones: 'Ահա հեռախոսների ընտրություն։',
    noPhonesAtAll: 'Հեռախոսներ ցուցակագրված չեն։',
    budgetFound: (l) => `Ահա $${l}-ից ցածր հեռախոսներ։`,
    budgetNone: (l) => `$${l}-ից ցածր հեռախոս չի գտնվել։`,
    fallback: 'Կարող եմ օգնել գտնել հեռախոս ըստ բրենդի, գնի, 5G-ի կամ ստուգել պատվեր։'
  },
  ru: {
    disabled: 'Чат временно недоступен.',
    askOrderNumber: 'Укажите номер заказа (формат PH-2026-000123).',
    orderStatus: (n,s,t) => `Статус заказа ${n}: ${s}. Итого: $${t}.`,
    orderNotFound: (n) => `Заказ с номером ${n} не найден.`,
    howToOrder: 'Откройте телефон, выберите цвет и память, нажмите "В корзину".',
    cheapestFound: (p) => `Самые доступные телефоны от $${p}.`,
    cheapestNone: 'Телефонов в наличии нет.',
    fiveGFound: (n) => `Вот ${n} телефонов с 5G.`,
    fiveGNone: 'Телефонов с 5G нет в списке.',
    camera: 'Это наши телефоны с самым высоким рейтингом и лучшими камерами.',
    colorsFound: (l) => `Доступные цвета: ${l}.`,
    colorsNone: 'Цвета зависят от модели.',
    storageFound: (l) => `Варианты памяти: ${l}.`,
    storageNone: 'Память зависит от модели.',
    brandFound: (n) => `Вот телефоны ${n}.`,
    brandNone: (n) => `Телефонов ${n} сейчас нет в наличии.`,
    samplePhones: 'Вот некоторые из наших телефонов.',
    noPhonesAtAll: 'Телефоны пока не добавлены.',
    budgetFound: (l) => `Телефоны до $${l}.`,
    budgetNone: (l) => `Телефонов дешевле $${l} не найдено.`,
    fallback: 'Могу помочь найти телефон по бренду, цене, 5G или проверить заказ.'
  },
  en: {
    disabled: 'Live chat is currently unavailable.',
    askOrderNumber: 'Please share your order number (format PH-2026-000123).',
    orderStatus: (n,s,t) => `Order ${n} status: ${s}. Total: $${t}.`,
    orderNotFound: (n) => `I couldn't find an order with number ${n}.`,
    howToOrder: 'Browse phones, pick color and storage, tap "Add to Cart". At checkout enter delivery details.',
    cheapestFound: (p) => `Our most affordable phones start at $${p}.`,
    cheapestNone: "We don't have any phones in stock right now.",
    fiveGFound: (n) => `Here are ${n} 5G phones we carry.`,
    fiveGNone: "We don't currently list any 5G phones.",
    camera: 'These are our top-rated phones, which also tend to have the strongest cameras.',
    colorsFound: (l) => `We offer colors including: ${l}.`,
    colorsNone: 'Color availability varies by phone.',
    storageFound: (l) => `Storage options include: ${l}.`,
    storageNone: 'Storage options vary by phone.',
    brandFound: (n) => `Here are the ${n} phones we carry.`,
    brandNone: (n) => `We don't currently have ${n} phones in stock.`,
    samplePhones: "Here's a sample of phones in our store.",
    noPhonesAtAll: 'We currently have no phones listed.',
    budgetFound: (l) => `Top-rated phones under $${l}.`,
    budgetNone: (l) => `No phones found under $${l}.`,
    fallback: "I can help you find phones by brand, price, 5G, camera, or check an order status."
  }
};

function R(language) { return REPLIES[language] || REPLIES.en; }

function extractPriceLimit(text) {
  const m = text.match(/(?:under|below|less than|up to|max|mintev|дешевле|до)\s*\$?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function extractOrderNumber(text) {
  const m = text.match(/PH-\d{4}-\d{6}/i);
  return m ? m[0].toUpperCase() : null;
}

function productSummary(p) {
  return {
    id: p._id, slug: p.slug, title: p.title, brand: p.brand?.name,
    price: p.price, image: p.images?.[0] || p.colors?.[0]?.images?.[0] || '',
    is5G: p.is5G, rating: p.rating
  };
}

async function handleChat(req, res, next) {
  try {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required.' });
    const lang = language || 'en';
    const r = R(lang);
    const settings = await ChatbotSettings.getSettings();
    if (!settings.enabled) return res.json({ reply: r.disabled, products: [] });

    const text = message.toLowerCase();
    const orderNumber = extractOrderNumber(message);

    if (orderNumber || text.includes('order') || text.includes('patver') || text.includes('zakaz')) {
      if (orderNumber) {
        const order = await Order.findOne({ orderNumber });
        if (order) return res.json({ reply: r.orderStatus(order.orderNumber, order.status, order.total.toFixed(2)), products: [] });
        return res.json({ reply: r.orderNotFound(orderNumber), products: [] });
      }
      return res.json({ reply: r.askOrderNumber, products: [] });
    }

    if (text.includes('delivery') || text.includes('shipping') || text.includes('araq') || text.includes('доставк')) {
      return res.json({ reply: settings.deliveryInfo, products: [] });
    }

    if (text.includes('how') || text.includes('inchpes') || text.includes('как')) {
      return res.json({ reply: r.howToOrder, products: [] });
    }

    if (text.includes('cheap') || text.includes('matche') || text.includes('дешев') || text.includes('lowest')) {
      const phones = await Product.find({ isActive: true, stock: { $gt: 0 } }).sort({ price: 1 }).limit(3).populate('brand','name');
      return res.json({ reply: phones.length ? r.cheapestFound(phones[0].price.toFixed(2)) : r.cheapestNone, products: phones.map(productSummary) });
    }

    if (text.includes('5g')) {
      const phones = await Product.find({ isActive: true, is5G: true }).sort({ soldCount: -1 }).limit(6).populate('brand','name');
      return res.json({ reply: phones.length ? r.fiveGFound(phones.length) : r.fiveGNone, products: phones.map(productSummary) });
    }

    if (text.includes('camera') || text.includes('tesaxcik') || text.includes('камер')) {
      const phones = await Product.find({ isActive: true }).sort({ rating: -1 }).limit(5).populate('brand','name');
      return res.json({ reply: r.camera, products: phones.map(productSummary) });
    }

    if (text.includes('color') || text.includes('guyn') || text.includes('цвет')) {
      const sample = await Product.find({ isActive: true }).limit(20);
      const colorSet = new Map();
      sample.forEach(p => p.colors.forEach(c => colorSet.set(c.name, c.hex)));
      const list = [...colorSet.keys()].slice(0,10).join(', ');
      return res.json({ reply: list ? r.colorsFound(list) : r.colorsNone, products: [] });
    }

    if (text.includes('storage') || text.includes('gb') || text.includes('tb') || text.includes('hishogh') || text.includes('памят')) {
      const sample = await Product.find({ isActive: true }).limit(30);
      const storageSet = new Set();
      sample.forEach(p => p.storageOptions.forEach(s => storageSet.add(s.capacity)));
      const list = [...storageSet].join(', ');
      return res.json({ reply: list ? r.storageFound(list) : r.storageNone, products: [] });
    }

    const brands = await Brand.find({ isActive: true });
    const mentionedBrand = brands.find(b => text.includes(b.name.toLowerCase()));
    if (mentionedBrand || text.includes('what phones') || text.includes('inch heraxa') || text.includes('какие телефоны')) {
      const filter = { isActive: true };
      if (mentionedBrand) filter.brand = mentionedBrand._id;
      const phones = await Product.find(filter).sort({ soldCount: -1 }).limit(6).populate('brand','name');
      let reply;
      if (phones.length) reply = mentionedBrand ? r.brandFound(mentionedBrand.name) : r.samplePhones;
      else reply = mentionedBrand ? r.brandNone(mentionedBrand.name) : r.noPhonesAtAll;
      return res.json({ reply, products: phones.map(productSummary) });
    }

    const priceLimit = extractPriceLimit(text);
    if (priceLimit) {
      const phones = await Product.find({ isActive: true, price: { $lte: priceLimit } }).sort({ rating: -1 }).limit(6).populate('brand','name');
      return res.json({ reply: phones.length ? r.budgetFound(priceLimit) : r.budgetNone(priceLimit), products: phones.map(productSummary) });
    }

    const faqMatch = settings.faqs.find(f => text.includes(f.question.toLowerCase().slice(0,12)));
    if (faqMatch) return res.json({ reply: faqMatch.answer, products: [] });

    return res.json({ reply: r.fallback, products: [] });
  } catch (err) { next(err); }
}

async function getSettings(req, res, next) {
  try { res.json(await ChatbotSettings.getSettings()); } catch (err) { next(err); }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await ChatbotSettings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) { next(err); }
}

module.exports = { handleChat, getSettings, updateSettings };
