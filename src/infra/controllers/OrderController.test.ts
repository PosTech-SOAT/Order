import 'reflect-metadata';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import OrderController from './OrderController';
import OrderCreateUseCase from '../../domain/use-cases/Order/OrderCreateUseCase';
import OrderListUseCase from '../../domain/use-cases/Order/OrderListUseCase';
import OrderFindOneUseCase from '../../domain/use-cases/Order/OrderFindOneUseCase';
import OrderDeleteUseCase from '../../domain/use-cases/Order/OrderDeleteUseCase';
import { fa, faker } from '@faker-js/faker';
import { OrderStatus } from '../../domain/entities/Order';
import { OrderDto } from '../dto/OrderDto';
import OrderUpdateStatusUseCase from '../../domain/use-cases/Order/OrderUpdateStatusUseCase';
import { IOrder } from '../entities/OrderEntity';
import { IOrdersProducts } from '../entities/OrdersProductsEntity';

jest.mock('tsyringe', () => ({
	injectable: () => jest.fn(),
	inject: () => jest.fn(),
	container: {
		resolve: jest.fn(),
	},
}));
describe('OrderController', () => {
	let orderController: OrderController;

	beforeEach(() => {
		orderController = new OrderController();
	});

	it('should create a new Order', async () => {
		const paymentLinkMock = faker.internet.url();
		const mockRequest = {
			body: {
				status: OrderStatus.RECEBIDO,
				clientId: faker.database.mongodbObjectId(),
				productIds: [faker.string.uuid(), faker.string.uuid()],
			},
		} as Request;

		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		const mockOrderCreateUseCase = {
			execute: jest.fn().mockReturnValue(mockRequest.body),
		} as unknown as OrderCreateUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockOrderCreateUseCase,
		);

		const mockOrderFindOneUseCase = {
			execute: jest.fn(),
		} as unknown as OrderFindOneUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockOrderFindOneUseCase,
		);

		const createPaymentFn = jest.fn().mockReturnValue(paymentLinkMock);
		const instanceMock = jest.fn().mockReturnValue({
			paymentRepository: {
				CreatePayment: createPaymentFn,
			},
		});

		await orderController.create(mockRequest, mockResponse, instanceMock());
		expect(createPaymentFn).toHaveBeenCalled();
		expect(mockOrderCreateUseCase.execute).toHaveBeenCalledWith(
			mockRequest.body,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(201);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Order created successfully',
			payment_url: paymentLinkMock,
		});
	});

	it('should return a list of Order', async () => {
		const OrderMock: OrderDto[] = [
			{
				id: faker.string.uuid(),
				status: OrderStatus.EM_PREPARACAO,
				products: [
					{
						id: faker.string.uuid(),
						name: faker.string.sample(),
						description: faker.string.sample(),
						price: faker.number.int(),
						category: {
							id: faker.string.uuid(),
							name: faker.string.sample(),
						},
					},
				],
				price: faker.number.int(),
			},
		];

		const mockOrderListUseCase = {
			execute: jest.fn().mockReturnValue(OrderMock),
		} as unknown as OrderListUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(mockOrderListUseCase);

		const mockRequest = {} as Request;
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await orderController.list(mockRequest, mockResponse);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith(OrderMock);
	});

	it('should return a Order by ID', async () => {
		const OrderMock: OrderDto = {
			id: faker.string.uuid(),
			status: OrderStatus.EM_PREPARACAO,
			products: [
				{
					id: faker.string.uuid(),
					name: faker.string.sample(),
					description: faker.string.sample(),
					price: faker.number.int(),
					category: {
						id: faker.string.uuid(),
						name: faker.string.sample(),
					},
				},
			],
			price: faker.number.int(),
		};

		const mockOrderFindOneUseCase = {
			execute: jest.fn().mockReturnValue(OrderMock),
		} as unknown as OrderFindOneUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockOrderFindOneUseCase,
		);

		const mockRequest = {
			params: {
				id: OrderMock.id,
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await orderController.findById(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockOrderFindOneUseCase.execute).toHaveBeenCalledWith(
			mockRequest.params.id,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith(OrderMock);
	});

	it('should change Order Status', async () => {
		const mockOrderUpdateStatusUseCase = {
			execute: jest.fn(),
		} as unknown as OrderUpdateStatusUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockOrderUpdateStatusUseCase,
		);

		const mockRequest = {
			params: {
				id: faker.database.mongodbObjectId(),
			},
			query: {
				status: OrderStatus.EM_PREPARACAO,
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await orderController.changeOrderStatus(
			mockRequest as unknown as Request,
			mockResponse,
			orderController,
		);
		expect(mockOrderUpdateStatusUseCase.execute).toHaveBeenCalledWith({
			id: mockRequest.params.id,
			status: mockRequest.query.status,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Order updated successfully',
		});
	});

	it('should fail at trying to change order status', async () => {
		const errorMessage = 'Ocorreu um erro ao tentar executar atualização';
		const mockOrderUpdateStatusUseCase = {
			execute: jest.fn().mockRejectedValue(new Error(errorMessage)),
		} as unknown as OrderUpdateStatusUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockOrderUpdateStatusUseCase,
		);

		const mockRequest = {
			params: {
				id: faker.database.mongodbObjectId(),
			},
			query: {
				status: OrderStatus.EM_PREPARACAO,
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await orderController.changeOrderStatus(
			mockRequest as unknown as Request,
			mockResponse,
			orderController,
		);
		expect(mockOrderUpdateStatusUseCase.execute).toHaveBeenCalledWith({
			id: mockRequest.params.id,
			status: mockRequest.query.status,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: errorMessage,
		});
	});

	it('should delete a Order by ID', async () => {
		const mockOrderDeleteUseCase = {
			execute: jest.fn(),
		} as unknown as OrderDeleteUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockOrderDeleteUseCase,
		);

		const mockRequest = {
			params: {
				id: faker.database.mongodbObjectId(),
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await orderController.delete(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockOrderDeleteUseCase.execute).toHaveBeenCalledWith(
			mockRequest.params.id,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Order deleted successfully',
		});
	});

	// it('should update order status by webhook trigger', async () => {
	// 	const mockOrderUpdateStatusUseCase = {
	// 		execute: jest.fn(),
	// 	} as unknown as OrderUpdateStatusUseCase;

	// 	(container.resolve as jest.Mock).mockReturnValueOnce(
	// 		mockOrderUpdateStatusUseCase,
	// 	);
	// 	const referenceID = faker.database.mongodbObjectId();
	// 	const mockRequest = {
	// 		params: {
	// 			id: referenceID,
	// 		},
	// 		query: {
	// 			external_reference: referenceID,
	// 			status: 'approved',
	// 		},
	// 	};
	// 	const mockResponse = {
	// 		status: jest.fn().mockReturnThis(),
	// 		json: jest.fn(),
	// 	} as unknown as Response;

	// 	await orderController.paymentWebhook(
	// 		mockRequest as unknown as Request,
	// 		mockResponse,
	// 		orderController,
	// 	);
	// 	expect(mockOrderUpdateStatusUseCase.execute).toHaveBeenCalledWith({
	// 		id: mockRequest.params.id,
	// 		status: OrderStatus.RECEBIDO,
	// 	});
	// 	expect(mockResponse.status).toHaveBeenCalledWith(200);
	// 	expect(mockResponse.json).toHaveBeenCalledWith({
	// 		message: 'Order updated successfully',
	// 		order_id: mockRequest.query.external_reference,
	// 	});
	// });
});
