import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// 允许所有跨域（Strikingly 必须这样）
app.use(cors());
app.options("*", cors());

app.use(express.json());

// ==== Telegram 配置（你自己换） ====
const BOT_TOKEN = "8233692415:AAGpBQMnijo1WmWx6eSlMYD-OGQ05a4uK8Y";
const USER_ID = "6062973135";
const GROUP_ID = "-1003420223151";

// Telegram 推送方法
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

// ======== 接收订单（前端发来） ========
app.post("/order", async (req, res) => {
  try {
    const order = req.body;

    const msg =
`🆕 *收到新订单*

📦 订单号：${order.orderId}
💰 金额：${order.amount}
🪙 币种：${order.currency}
📘 套餐：${order.plan}
👤 用户：${order.userId}
`;

    // 推送给你
    await sendToTelegram(USER_ID, msg);

    // 推送给群
    await sendToTelegram(GROUP_ID, msg);

    res.json({ success: true });

  } catch (err) {
    console.error("Telegram 发送失败：", err);
    res.status(500).json({ success: false });
  }
});

// Railway 默认端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
