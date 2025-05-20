require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

const app = express();
const PORT = 3000;

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const DIRECT_EXCHANGE = "calc_direct";
const FANOUT_EXCHANGE = "calc_fanout";

app.use(express.static("public"));
app.use(bodyParser.json());

const results = [];
let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertExchange(DIRECT_EXCHANGE, "direct", { durable: false });
  await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: false });

  await channel.assertQueue("calcul_results", { durable: false });

  channel.consume("calcul_results", (msg) => {
    if (msg !== null) {
      const result = JSON.parse(msg.content.toString());
      results.push(result);
      channel.ack(msg);
    }
  });
}

app.post("/send", async (req, res) => {
  const { n1, n2, op } = req.body;

  if (!["add", "sub", "mul", "div", "all"].includes(op)) {
    return res.status(400).json({ error: "Invalid operation" });
  }

  const message = { n1, n2, op };
  const buffer = Buffer.from(JSON.stringify(message));

  try {
    if (op === "all") {
      channel.publish(FANOUT_EXCHANGE, "", buffer);
    } else {
      channel.publish(DIRECT_EXCHANGE, op, buffer);
    }

    res.status(200).json({ status: "Message sent", message });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/results", (req, res) => {
  res.json(results);
});

app.listen(PORT, async () => {
  await connectRabbitMQ();
  console.log(`server is running : http://localhost:${PORT}`);
});
