const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// ✔ 允许 Strikingly 发送 POST
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Telegram 配置
const BOT_TOKEN = "8233692415:AAGpBQMnijo1WmWx6eSlMYD-OGQ05a4uK8Y";
const ADMIN_ID = "6062973135";     // 私聊
const GROUP_ID = "-1002381136826"; // 群ID（如果有）

// 处理订单
app.post("/order", async (req, res) => {
  console.log("📩 Received order:", req.body);

  const { orderId, amount, currency, plan, userId } = req.body;

  if (!orderId || !amount || !currency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const text = `
💰 *New Order Created*
━━━━━━━━━━━━━━
📌 *Order ID*: ${orderId}
💵 *Amount*: ${amount} USD
🪙 *Currency*: ${currency}
📦 *Plan*: ${plan}
👤 *User*: ${userId}
━━━━━━━━━━━━━━
  `;

  try {
    // 发给管理员
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: ADMIN_ID,
        text,
        parse_mode: "Markdown",
      }
    );

    // 发给群组（如果你需要）
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: GROUP_ID,
        text,
        parse_mode: "Markdown",
      }
    );

    return res.json({ status: "ok", message: "Telegram sent" });
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Telegram send failed" });
  }
});

// 保活
app.get("/", (req, res) => res.send("Bot Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
