import { Channel, connect, Connection, Message } from 'amqplib';

export default class RabbitmqServer {
	private connection: Connection;
	private channel: Channel;

	constructor(private uri: string) {
		process.on('SIGINT', async () => {
			console.log('Closing connection...');
			if (this.channel) {
				await this.channel.close();
				await this.connection.close();
			}
			process.exit(0);
		});
	}

	async start(): Promise<void> {
		this.connection = await connect(this.uri);
		this.channel = await this.connection.createChannel();
	}

	async keepConnection(queue: string) {
		await this.channel.assertQueue(queue, { durable: true });
	}

	async enQueue(queue: string, message: string) {
		return this.channel.sendToQueue(queue, Buffer.from(message));
	}

	async listen(queue: string, callback: (message: Message) => void) {
		return this.channel.consume(
			queue,
			async (msg) => {
				if (msg !== null) {
					try {
						await callback(msg);
						// this.channel.ack(msg); // Confirmar a mensagem após o processamento bem-sucedido
					} catch (error) {
						this.channel.nack(msg, false, true); // Rejeitar a mensagem e reencaminhar para a fila em caso de erro
						console.error('Erro ao processar a mensagem:', error);
					}
				}
			},
			{ noAck: true },
		);
	}
}
