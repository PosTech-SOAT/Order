import { Request, Response } from 'express';
import { container, inject } from 'tsyringe';
import OrderCreateUseCase from '../../domain/use-cases/Order/OrderCreateUseCase';
import OrderListUseCase from '../../domain/use-cases/Order/OrderListUseCase';
import OrderListByStatusUseCase from '../../domain/use-cases/Order/OrderListByStatusUseCase';
import OrderFindOneUseCase from '../../domain/use-cases/Order/OrderFindOneUseCase';
import OrderUpdateStatusUseCase from '../../domain/use-cases/Order/OrderUpdateStatusUseCase';
import { OrderStatus } from '../../domain/entities/Order';
import OrderDeleteUseCase from '../../domain/use-cases/Order/OrderDeleteUseCase';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentWebhookRequestParams } from '../dto/PaymentWebhookRequestDto';
import { IPaymentRepository } from '../../domain/interfaces/repositories/IPaymentRepository';
import rabbitMqInstance from '../../data/data-sources/factories/RabbitMqInstance';
import { Message } from 'amqplib';
import OrderLgpdExecutionUseCase from '../../domain/use-cases/Order/OrderLgpdExecutionUseCase';

export default class OrderController {
	private paymentRepository: IPaymentRepository;
	constructor() {
		this.paymentRepository = new PaymentRepository();
	}

	async create(
		request: Request,
		response: Response,
		instance: OrderController,
	) {
		const createOrderUseCase = container.resolve(OrderCreateUseCase);
		try {
			const order = await createOrderUseCase.execute(request.body);
			const findOneOrderUseCase = container.resolve(OrderFindOneUseCase);
			const payment_url = await instance.paymentRepository.CreatePayment(
				await findOneOrderUseCase.execute(order.id),
			);
			await rabbitMqInstance.start();
			await rabbitMqInstance.enQueue('new_order', JSON.stringify(order));

			return response.status(201).json({
				message: 'Order created successfully',
				payment_url: payment_url,
			});
		} catch (error: any) {
			return response.status(400).json({ message: error.message });
		}
	}

	async list(request: Request, response: Response) {
		const listOrderUseCase = container.resolve(OrderListUseCase);
		try {
			const orders = await listOrderUseCase.execute();

			return response.status(200).json(orders);
		} catch (error: any) {
			return response.status(400).json({ message: error.message });
		}
	}

	async listByStatus(reques: Request, response: Response) {
		const listOrderByStatusUseCase = container.resolve(
			OrderListByStatusUseCase,
		);
		try {
			const orders = await listOrderByStatusUseCase.execute();

			return response.status(200).json(orders);
		} catch (error: any) {
			return response.status(400).json({ message: error.message });
		}
	}

	async findById(request: Request, response: Response) {
		const findOneOrderUseCase = container.resolve(OrderFindOneUseCase);
		try {
			const order = await findOneOrderUseCase.execute(request.params.id);

			return response.status(200).json(order);
		} catch (error: any) {
			return response.status(400).json({ message: error.message });
		}
	}

	private async executeStatusUpdate(id: string, status: OrderStatus) {
		const findOneOrderUseCase = container.resolve(OrderUpdateStatusUseCase);
		await findOneOrderUseCase.execute({ id, status });
	}

	async changeOrderStatus(
		request: Request,
		response: Response,
		instance: OrderController,
	) {
		try {
			await instance.executeStatusUpdate(
				request.params.id,
				request.query.status as OrderStatus,
			);
			return response
				.status(200)
				.json({ message: 'Order updated successfully' });
		} catch (error: any) {
			return response.status(400).json({ message: error.message });
		}
	}

	async paymentWebhook(message: Message, instance: OrderController) {
		try {
			const query = JSON.parse(
				message.content.toString(),
			) as PaymentWebhookRequestParams;

			console.log('🔍 Dados recebidos no webhook:', query);

			const status =
				query.status === 'approved'
					? OrderStatus.RECEBIDO
					: OrderStatus.AGUARDANDO_PAGAMENTO;

			console.log(`📊 Atualizando status para: ${status}`);

			await instance.executeStatusUpdate(query.external_reference, status);

			console.log('🛠 Banco de dados atualizado com sucesso');

			// Confirmar que a mensagem foi processada com sucesso
			return Promise.resolve();
		} catch (error) {
			console.error('❌ Erro ao processar o webhook de pagamento:', error);

			// Devolver a mensagem à fila caso haja um erro
			return Promise.reject(error);
		}
	}

	async delete(request: Request, response: Response) {
		const deleteOrderUseCase = container.resolve(OrderDeleteUseCase);
		try {
			await deleteOrderUseCase.execute(request.params.id);

			return response
				.status(200)
				.json({ message: 'Order deleted successfully' });
		} catch (error: any) {
			return response.status(400).json({ message: error.message });
		}
	}

	async lgpdExecution(clientId: string) {
		const deleteOrderUseCase = container.resolve(OrderLgpdExecutionUseCase);
		try {
			await deleteOrderUseCase.execute(clientId);

			return Promise.resolve();
		} catch (error: any) {
			return Promise.reject();
		}
	}
}
