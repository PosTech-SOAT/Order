import RabbitmqServer from './RabbitqmServer';

const rabbitMqInstance = new RabbitmqServer(
	`amqp://${process.env.AMQP_USER}:${process.env.AMQP_PASS}@${process.env.AMQP_HOST}:${process.env.AMQP_PORT}`,
);

export default rabbitMqInstance;
