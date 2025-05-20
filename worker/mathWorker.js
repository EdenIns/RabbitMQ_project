const amqp = require("amqplib");
const { randomInt } = require("crypto");

const RABBITMQ_URL = "amqp://user:password@efrei20250519.hopto.org:5674";
const REQUEST_QUEUE = "calcul_requests";
const RESULT_QUEUE = "calcul_results";

async function startWorker() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(REQUEST_QUEUE, { durable: false });
    await channel.assertQueue(RESULT_QUEUE, { durable: false });

    channel.consume(
      REQUEST_QUEUE,
      async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          console.log(`Received request:`, data);

          const delay = randomInt(5000, 15000);
          await new Promise((res) => setTimeout(res, delay));

          const result = {
            n1: data.n1,
            n2: data.n2,
            op: "add",
            result: data.n1 + data.n2,
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
