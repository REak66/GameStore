const express = require('express');
const router = express.Router();
const { sendTelegramMessage } = require('../services/telegram.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const GAMESTORE_SYSTEM_PROMPT = `You are GameBot, a friendly and knowledgeable AI assistant for GameStore — an online digital game shopping platform. Your role is to help customers with questions about:

- Browsing and purchasing digital game keys and gaming products
- Order status, download links, and activation keys
- Payment methods (Visa, Mastercard, PayPal, Apple Pay, cryptocurrency)
- Account management (registration, login, password reset, profile)
- Refund policy (7-day window, unactivated keys only)
- Wishlist, cart, and checkout process
- Technical issues with keys or downloads
- Platform support (Steam, Epic Games, GOG, etc.)

Guidelines:
- Be concise, helpful, and friendly
- For complex billing/order issues, suggest contacting human support via the Contact Support tab
- Never make up order details or account information
- Keep responses under 120 words unless the question genuinely requires more detail
- Use simple, clear language`;

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

// POST /api/support/ai-ask
router.post('/ai-ask', async (req, res) => {
  const { question, history } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Question is required.' });
  }

  const trimmed = question.trim().slice(0, 500);

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return res.status(503).json({ success: false, message: 'AI service is not configured.' });
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const chatHistory = Array.isArray(history)
    ? history
        .slice(-10)
        .filter(m => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
    : [];

  // ── 1. Try Gemini ────────────────────────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    const geminiHistory = chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const modelName of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: GAMESTORE_SYSTEM_PROMPT,
          });
          const chat = model.startChat({ history: geminiHistory });
          const result = await chat.sendMessage(trimmed);
          return res.json({ success: true, answer: result.response.text(), provider: 'gemini' });
        } catch (err) {
          const status = err.message.match(/\[(\d{3})/)?.[1];
          if (status === '503' && attempt === 0) { await sleep(2000); continue; }
          break;
        }
      }
    }
  }

  // ── 2. Fallback: Groq (Llama 3) ─────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const groqMessages = [
        { role: 'system', content: GAMESTORE_SYSTEM_PROMPT },
        ...chatHistory.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: 'user', content: trimmed },
      ];
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 400,
      });
      const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      return res.json({ success: true, answer, provider: 'groq' });
    } catch (err) {
      console.error('Groq AI error:', err.message);
    }
  }

  res.status(500).json({ success: false, message: 'AI service is temporarily unavailable. Please try again in a moment.' });
});

module.exports = router;
