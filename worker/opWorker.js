const amqp = require("amqplib");
require("dotenv").config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const DIRECT_EXCHANGE = "calc_direct";
const FANOUT_EXCHANGE = "calc_fanout";
const RESULT_QUEUE = "calcul_results";

const operation = process.argv[2];

if (!["add", "sub", "mul", "div"].includes(operation)) {
  process.exit(1);
}

function compute(n1, n2, op) {
  switch (op) {
    case "add":
      return n1 + n2;
    case "sub":
      return n1 - n2;
    case "mul":
      return n1 * n2;
    case "div":
      return n2 !== 0 ? n1 / n2 : null;
    default:
      return null;
  }
}

async function startWorker() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    await channel.assertExchange(DIRECT_EXCHANGE, "direct", { durable: false });
    await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: false });
    await channel.assertQueue(RESULT_QUEUE, { durable: false });

    const q = await channel.assertQueue("", { exclusive: true });

    await channel.bindQueue(q.queue, DIRECT_EXCHANGE, operation);
    await channel.bindQueue(q.queue, FANOUT_EXCHANGE, "");

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());

          if (data.op !== operation && data.op !== "all") {
            return channel.ack(msg);
          }

          const delay = Math.floor(Math.random() * 10000) + 5000;
          await new Promise((res) => setTimeout(res, delay));

          const resultValue = compute(data.n1, data.n2, operation);

          const result = {
            ...data,
            op: operation,
            result: resultValue,
          };

          channel.sendToQueue(
            RESULT_QUEUE,
            Buffer.from(JSON.stringify(result))
          );
          console.log(`Sent result after ${delay / 1000}s:`, result);

          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("Worker error:", err);
  }
}

startWorker();
