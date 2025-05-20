const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://user:password@efrei20250519.hopto.org:5674";
const RESULT_QUEUE = "calcul_results";

async function startReader() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(RESULT_QUEUE, { durable: false });

    channel.consume(
      RESULT_QUEUE,
      (msg) => {
        if (msg !== null) {
          const result = JSON.parse(msg.content.toString());

          console.log(
            `Result received: ${result.n1} ${result.op} ${result.n2} = ${result.result}`
          );

          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("Error reading results:", err);
  }
}

startReader();
