import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ==== Telegram 配置（你可自行替换） ====
const BOT_TOKEN = "8233692415:AAGpBQMnijo1WmWx6eSlMYD-OGQ05a4uK8Y";
const USER_ID = "6062973135";
const GROUP_ID = "-1003420223151";

// ======== Telegram 发送方法 ========

async function sendToTelegram(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown"
    })
  });
}

// ======== 接收订单 API（前端调用） ========

app.post("/order", async (req, res) => {
  try {
    const order = req.body;

    // 前端发送的字段：orderId / amount / currency / userId / plan
    const msg =
      `🆕 *收到新订单*\n\n` +
      `📦 订单号：${order.orderId}\n` +
      `💰 金额：${order.amount}\n` +
      `🪙 币种：${order.currency}\n` +
      `📘 套餐：${order.plan}\n` +
      `👤 用户：${order.userId}`;

    // 发给你
    await sendToTelegram(USER_ID, msg);

    // 发到群
    await sendToTelegram(GROUP_ID, msg);

    res.json({ success: true, message: "订单已推送到 Telegram" });

  } catch (err) {
    console.error("发送失败：", err);
    res.status(500).json({ success: false, error: "发送失败" });
  }
});

// ======== Railway 默认端口 ========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
