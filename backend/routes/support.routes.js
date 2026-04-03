const express = require('express');
const router = express.Router();
const { sendTelegramMessage } = require('../services/telegram.service');

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const SUBJECT_LABELS = {
  order:      'Order Issue',
  payment:    'Payment Problem',
  account:    'Account Access',
  refund:     '↩Refund Request',
  technical:  'Technical Problem',
  suggestion: 'Suggestion / Feedback',
  other:      'Other',
};

// POST /api/support/contact
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  const subjectLabel = SUBJECT_LABELS[subject] || escapeHtml(subject) || 'Not specified';

  const text =
    `<b>Support Message Received</b>\n\n` +
    `<b>Name:</b> ${escapeHtml(name)}\n` +
    `<b>Email:</b> <code>${escapeHtml(email)}</code>\n` +
    `<b>Subject:</b> ${subjectLabel}\n\n` +
    `<b>Message:</b>\n${escapeHtml(message)}`;

  try {
    await sendTelegramMessage(text);
    res.json({ success: true, message: 'Your message has been sent! We\'ll get back to you within 24 hours.' });
  } catch (err) {
    console.error('Support contact Telegram error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
