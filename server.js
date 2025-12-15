const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
// ================= Telegram Notify =================
async function sendTelegram(text) {
  if (!process.env.TG_BOT_TOKEN) return;

  try {
    // 群
    await axios.post(
      `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TG_GROUP_ID,
        text,
        parse_mode: "HTML"
      }
    );

    // 私聊你
    await axios.post(
      `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TG_ADMIN_ID,
        text,
        parse_mode: "HTML"
      }
    );
  } catch (e) {
    console.error("❌ Telegram error:", e.response?.data || e.message);
  }
}

// ===================================================

// 允许所有来源（Strikingly 必须）
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

// Telegram 配置（必须使用 Railway Variables）
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const ADMIN_ID = process.env.TG_ADMIN_ID;   // 私聊 ID
const GROUP_ID = process.env.TG_GROUP_ID;   // 群 ID

// 接收订单
app.post("/order", async (req, res) => {

  console.log("TG ENV CHECK:", {
    BOT_TOKEN: !!BOT_TOKEN,
    ADMIN_ID,
    GROUP_ID
  });
  console.log("📩 Received order:", req.body);

  const { orderId, amount, currency, plan, userId } = req.body;

  if (!orderId || !amount || !currency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

const text = `
💰 *New Order Created*
━━━━━━━━━━━━━━
📌 *Order ID:* ${orderId}
💵 *Amount:* ${amount} USD
🪙 *Currency:* ${currency}
📦 *Plan:* ${plan}
👤 *User:* ${userId || "-"}
━━━━━━━━━━━━━━
`;
  try {
    // 私聊通知
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_ID, text, parse_mode: "Markdown"
    });

    // 群通知
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: GROUP_ID, text, parse_mode: "Markdown"
    });

    return res.json({ status: "ok", message: "Telegram sent" });
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Telegram send failed" });
  }
});

// 主页保活
app.get("/", (req, res) => res.send("Bot Running"));

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
