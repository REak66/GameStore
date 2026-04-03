const express = require('express');
const router = express.Router();
const { sendTelegramMessage } = require('../services/telegram.service');

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// POST /api/newsletter
router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  try {
    await sendTelegramMessage(`<b>New Newsletter Subscription</b>\nEmail: <code>${escapeHtml(email)}</code>`);
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to notify via Telegram.' });
  }
});

module.exports = router;
