const amqp = require("amqplib");
const { randomInt } = require("crypto");

const RABBITMQ_URL = "amqp://user:password@efrei20250519.hopto.org:5674";
const QUEUE_NAME = "calcul_requests";

async function connectAndSend() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });

    setInterval(() => {
      const n1 = randomInt(1, 100);
      const n2 = randomInt(1, 100);

      const message = {
        n1,
        n2,
      };

      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
      console.log("Message sent :", message);
    }, 5000);
  } catch (err) {
    console.error("Error", err);
  }
}

connectAndSend();
