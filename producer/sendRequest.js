const amqp = require("amqplib");
const { randomInt } = require("crypto");

const RABBITMQ_URL = "amqp://user:password@efrei20250519.hopto.org:5674";
const EXCHANGE_NAME = "calc_direct";

const operations = ["add", "sub", "mul", "div"];

function getRandomOp() {
  const index = randomInt(operations.length);
  return operations[index];
}

async function connectAndSend() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: false });

    setInterval(() => {
      const n1 = randomInt(1, 100);
      const n2 = randomInt(1, 100);
      const op = getRandomOp();

      const message = { n1, n2, op };

      channel.publish(EXCHANGE_NAME, op, Buffer.from(JSON.stringify(message)));

      console.log(`Sent to "${op}" :`, message);
    }, 5000);
  } catch (err) {
    console.error("Error:", err);
  }
}

connectAndSend();
