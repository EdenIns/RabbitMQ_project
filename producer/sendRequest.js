const amqp = require("amqplib");
const { randomInt } = require("crypto");
require("dotenv").config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const DIRECT_EXCHANGE = "calc_direct";
const FANOUT_EXCHANGE = "calc_fanout";

const operations = ["add", "sub", "mul", "div", "all"];

function getRandomOp() {
  const index = randomInt(operations.length);
  return operations[index];
}

async function connectAndSend() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(DIRECT_EXCHANGE, "direct", { durable: false });
    await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: false });

    setInterval(() => {
      const n1 = randomInt(1, 100);
      const n2 = randomInt(1, 100);
      const op = getRandomOp();

      const message = { n1, n2, op };
      const buffer = Buffer.from(JSON.stringify(message));

      if (op === "all") {
        channel.publish(FANOUT_EXCHANGE, "", buffer);
        console.log(`use fanout:`, message);
      } else {
        channel.publish(DIRECT_EXCHANGE, op, buffer);
        console.log(`Sent to "${op}":`, message);
      }
    }, 5000);
  } catch (err) {
    console.error("Error:", err);
  }
}

connectAndSend();
