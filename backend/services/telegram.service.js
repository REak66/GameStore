const https = require("https");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram config missing, skipping notification");
    return Promise.resolve();
  }

  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: "HTML",
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else {
            console.error("Telegram API error:", body);
            reject(new Error(`Telegram API responded with ${res.statusCode}`));
          }
        });
      },
    );
    req.on("error", (err) => {
      console.error("Telegram request failed:", err.message);
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

function sendPaymentSuccessAlert(order, user) {
  const itemsList = order.orderItems
    .map(
      (item) =>
        `  - ${item.name} ($${item.price.toFixed(2)})`,
    )
    .join("\n");
  const message =
    `<b>Payment Successful</b>\n\n` +
    `<b>Order ID:</b> ${order._id}\n` +
    `<b>Customer:</b> ${user.name}\n` +
    `<b>Email:</b> ${user.email}\n` +
    `<b>Payment Method:</b> ${order.paymentMethod}\n` +
    `<b>Items:</b>\n${itemsList}\n\n` +
    `<b>Subtotal:</b> $${order.itemsPrice.toFixed(2)}\n` +
    `<b>Tax:</b> $${order.taxPrice.toFixed(2)}\n` +
    `<b>Total:</b> $${order.totalPrice.toFixed(2)}\n` +
    `<b>Paid At:</b> ${order.paidAt.toLocaleString()}`;
  return sendTelegramMessage(message);
}
module.exports = { sendTelegramMessage, sendPaymentSuccessAlert };