import { connect } from "amqplib";

const exportsService = {
  async _sendMessage(queue: string, message: string): Promise<void> {
    const connection = await connect(process.env.RABBITMQ_SERVER!);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => connection.close(), 1000);
  },
};

export default exportsService;
