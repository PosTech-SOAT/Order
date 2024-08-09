import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerFile from './infra/openapi/openapi.json';

import './infra/controllers/container';
import router from './presentation';
import { configDotenv } from 'dotenv';
import rabbitMqInstance from './data/data-sources/factories/RabbitMqInstance';
import OrderController from './infra/controllers/OrderController';
async function bootstrap() {
	configDotenv();
	const app = express();
	await app.use(express.json());
	await app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

	await app.use('/api', router);

	await app.listen(3000, () => {
		console.log('🔥 Server listening at http://localhost:3000/api-docs');
		console.log(
			process.env.DB_HOST,
			process.env.DB_USER,
			process.env.DB_PASS,
			process.env.DB_NAME,
		);
		console.log(
			`${process.env.AMQP_USER}:${process.env.AMQP_PASS}@${process.env.AMQP_HOST}:${process.env.AMQP_PORT}`,
		);
	});

	const listenPaymentQueue = async () => {
		try {
			const orderController = new OrderController();
			await rabbitMqInstance.start();
			console.log('🚀 RabbitMQ connected and listening...');
			await rabbitMqInstance.listen('payment_update', async (message) => {
				try {
					console.log('Mensagem recebida:', message);
					await orderController.paymentWebhook(message, orderController);
					console.log('📥 Mensagem processada com sucesso');
				} catch (error) {
					console.error('❌ Erro ao processar a mensagem:', error);
				}
			});
		} catch (error) {
			console.error('❌ Erro ao iniciar o listener do RabbitMQ:', error);
		}
	};

	const listenLgpdQueue = async () => {
		try {
			const orderController = new OrderController();
			await rabbitMqInstance.start();
			console.log('🚀 RabbitMQ connected and listening...');
			const handleMessage = async (id: string) => {
				await orderController.lgpdExecution(id);
			};
			await rabbitMqInstance.keepConnection('lgpd_execution');
			await rabbitMqInstance.listen('lgpd_execution', async (message) => {
				try {
					console.log('Mensagem recebida:', message);
					const exclusionForm: Record<string, string> = JSON.parse(
						message.content.toString(),
					);
					if (exclusionForm.exclude) {
						await handleMessage(exclusionForm.id);
					}
					console.log('📥 Mensagem processada com sucesso');
				} catch (error) {
					console.error('❌ Erro ao processar a mensagem:', error);
				}
			});
		} catch (error) {
			console.error('❌ Erro ao iniciar o listener do RabbitMQ:', error);
		}
	};
	setTimeout(() => {
		listenPaymentQueue();
		listenLgpdQueue();
	}, 5000);
}

bootstrap();
