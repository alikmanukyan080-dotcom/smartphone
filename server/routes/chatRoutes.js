const express = require('express');
const rateLimit = require('express-rate-limit');
const { handleChat, getSettings, updateSettings } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many messages. Please slow down.' }
});

router.post('/', chatLimiter, handleChat);
router.get('/settings', getSettings);
router.put('/settings', protect, updateSettings);

module.exports = router;
