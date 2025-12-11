import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ==== Telegram 配置（100% 确认不要互换） ====
const BOT_TOKEN = "8233692415:AAGpBQMnijo1WmWx6eSlMYD-OGQ05a4uK8Y";
const USER_ID = "6062973135";          // 你接收信息
const GROUP_ID = "-1003420223151";     // 群 ID（机器人必须是管理员）

// ======== Telegram 发送方法（带错误打印） ========
async function sendToTelegram(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown"
    })
  });

  const json = await res.json();
  console.log("[Telegram API 回应]:", json);
  return json;
}

// ======== 接收订单 API（前端调用） ========
app.post("/order", async (req, res) => {
  try {
    const order = req.body;

    // 同时兼容你所有前端可能发送过来的字段
    const orderId = order.orderId || order.id || "UNKNOWN";
    const amount = order.amount || order.money || order.total || 0;
    const currency = order.currency || order.coin || "USDT";
    const userId = order.userId || order.user || "unknown-user";
    const plan = order.plan || order.package || "UNKNOWN PLAN";

    const msg =
      `🆕 *收到新订单*\n\n` +
      `📦 订单号：${orderId}\n` +
      `💰 金额：${amount}\n` +
      `🪙 币种：${currency}\n` +
      `📘 套餐：${plan}\n` +
      `👤 用户：${userId}`;

    // 发给你
    await sendToTelegram(USER_ID, msg);

    // 发到群
    await sendToTelegram(GROUP_ID, msg);

    res.json({ success: true, message: "订单已推送到 Telegram" });

  } catch (err) {
    console.error("发送失败：", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======== Railway 默认端口 ========
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
