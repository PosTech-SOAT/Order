import 'reflect-metadata';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import ProductController from './ProductController';
import ProductCreateUseCase from '../../domain/use-cases/Product/ProductCreateUseCase';
import ProductListUseCase from '../../domain/use-cases/Product/ProductListUseCase';
import ProductFindOneUseCase from '../../domain/use-cases/Product/ProductFindOneUseCase';
import ProductDeleteUseCase from '../../domain/use-cases/Product/ProductDeleteUseCase';
import { faker } from '@faker-js/faker';
import { IProduct } from '../entities/ProductEntity';
import ProductUpdateUseCase from '../../domain/use-cases/Product/ProductUpdateUseCase';
import ProductListByCategoryUseCase from '../../domain/use-cases/Product/ProductListByCategoryUseCase';

jest.mock('tsyringe', () => ({
	injectable: () => jest.fn(),
	inject: () => jest.fn(),
	container: {
		resolve: jest.fn(),
	},
}));
describe('ProductController', () => {
	let productController: ProductController;

	beforeEach(() => {
		productController = new ProductController();
	});

	it('should return a list of Product', async () => {
		const ProductMock: IProduct[] = [
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
		];

		const mockProductListUseCase = {
			execute: jest.fn().mockReturnValue(ProductMock),
		} as unknown as ProductListUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductListUseCase,
		);

		const mockRequest = {} as Request;
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await productController.list(mockRequest, mockResponse);
		expect(mockProductListUseCase.execute).toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith(ProductMock);
	});

	it('should return a Product by ID', async () => {
		const ProductMock: IProduct = {
			id: faker.string.uuid(),
			name: faker.string.sample(),
			description: faker.string.sample(),
			price: faker.number.int(),
			category: {
				id: faker.string.uuid(),
				name: faker.string.sample(),
			},
		};

		const mockProductFindOneUseCase = {
			execute: jest.fn().mockReturnValue(ProductMock),
		} as unknown as ProductFindOneUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductFindOneUseCase,
		);

		const mockRequest = {
			params: {
				id: ProductMock.id,
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await productController.findById(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockProductFindOneUseCase.execute).toHaveBeenCalledWith(
			mockRequest.params.id,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith(ProductMock);
	});

	it('should return a Product by ID', async () => {
		const ProductMock: IProduct[] = [
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
		];

		const mockProductListByCategoryUseCase = {
			execute: jest.fn().mockReturnValue(ProductMock),
		} as unknown as ProductListByCategoryUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductListByCategoryUseCase,
		);

		const mockRequest = {
			params: {
				id: ProductMock[0].category.id,
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await productController.findAllByCategory(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockProductListByCategoryUseCase.execute).toHaveBeenCalledWith(
			mockRequest.params.id,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith(ProductMock);
	});

	it('should delete a Product by ID', async () => {
		const mockProductDeleteUseCase = {
			execute: jest.fn(),
		} as unknown as ProductDeleteUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductDeleteUseCase,
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

		await productController.delete(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockProductDeleteUseCase.execute).toHaveBeenCalledWith(
			mockRequest.params.id,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Product deleted successfully',
		});
	});

	it('should update a Product', async () => {
		const mockProductUpdateUseCase = {
			execute: jest.fn(),
		} as unknown as ProductUpdateUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductUpdateUseCase,
		);

		const mockRequest = {
			params: {
				id: faker.database.mongodbObjectId(),
			},
			body: {
				name: faker.string.sample(),
				price: faker.number.int(),
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await productController.update(
			mockRequest as unknown as Request,
			mockResponse,
		);

		expect(mockProductUpdateUseCase.execute).toHaveBeenCalledWith({
			id: mockRequest.params.id,
			body: mockRequest.body,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Product updated successfully',
		});
	});

	it('should create a new Product', async () => {
		const mockRequest = {
			body: {
				name: faker.string.sample(),
				description: faker.string.sample(),
				price: faker.number.int(),
				category: {
					id: faker.string.uuid(),
					name: faker.string.sample(),
				},
			},
		} as Request;

		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		const mockProductCreateUseCase = {
			execute: jest.fn().mockReturnValue(mockRequest.body),
		} as unknown as ProductCreateUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductCreateUseCase,
		);

		const mockProductFindOneUseCase = {
			execute: jest.fn(),
		} as unknown as ProductFindOneUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockProductFindOneUseCase,
		);

		await productController.create(mockRequest, mockResponse);
		expect(mockProductCreateUseCase.execute).toHaveBeenCalledWith(
			mockRequest.body,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(201);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Product created successfully',
		});
	});
});
