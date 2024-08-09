/* eslint-disable indent */
import { inject, injectable } from 'tsyringe';
import { IOrderRepository } from '../../interfaces/repositories/IOrderRepository';
import { IOrder } from '../../../infra/entities/OrderEntity';
import { IBaseUseCase } from '../../interfaces/use-cases/IBaseUseCase';
import rabbitMqInstance from '../../../data/data-sources/factories/RabbitMqInstance';
import { LGPDStatusExecution } from '../../../infra/dto/LGPDFormDto';

@injectable()
export default class OrderLgpdExecutionUseCase
	implements IBaseUseCase<string, void>
{
	constructor(
		@inject('OrderRepository')
		private orderRepository: IOrderRepository,
	) {}

	async execute(clientId: string): Promise<void> {
		try {
			await rabbitMqInstance.start();
			await this.orderRepository.deleteAllOrdersByClientid(clientId);
			await rabbitMqInstance.enQueue(
				'lgpd_conclusion',
				JSON.stringify({ id: clientId, status: LGPDStatusExecution.SUCCESS }),
			);
		} catch (error) {
			await rabbitMqInstance.enQueue(
				'lgpd_conclusion',
				JSON.stringify({ status: LGPDStatusExecution.FAILED }),
			);
			throw new Error('An error ocurred while deleting all orders by a client');
		}
	}
}
