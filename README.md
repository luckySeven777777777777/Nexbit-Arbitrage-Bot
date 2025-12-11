# Telegram Order Push Server

部署到 Railway 后  
向 /order POST 提交订单 JSON，即可自动发送到 Telegram。

示例请求：
POST /order
{
  "id": "ORD883393",
  "amount": 100,
  "currency": "USDT",
  "user": "testUser"
}
