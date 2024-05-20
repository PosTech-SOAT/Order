import 'reflect-metadata';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import CategoryController from './CategoryController';
import CategoryCreateUseCase from '../../domain/use-cases/Category/CategoryCreateUseCase';
import CategoryListUseCase from '../../domain/use-cases/Category/CategoryListUseCase';
import CategoryFindOneUseCase from '../../domain/use-cases/Category/CategoryFindOneUseCase';
import CategoryDeleteUseCase from '../../domain/use-cases/Category/CategoryDeleteUseCase';
import CategoryUpdateUseCase from '../../domain/use-cases/Category/CategoryUpdateUseCase';
import { ICategory } from '../entities/CategoryEntity';
import { faker } from '@faker-js/faker';

jest.mock('tsyringe', () => ({
	injectable: () => jest.fn(),
	inject: () => jest.fn(),
	container: {
		resolve: jest.fn(),
	},
}));
describe('CategoryController', () => {
	let categoryController: CategoryController;

	beforeEach(() => {
		categoryController = new CategoryController();
	});

	describe('create', () => {
		it('should create a new category', async () => {
			const mockRequest = { body: { name: 'TestCategory' } } as Request;
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			} as unknown as Response;

			const mockCategoryCreateUseCase = {
				execute: jest.fn(),
			} as unknown as CategoryCreateUseCase;

			(container.resolve as jest.Mock).mockReturnValueOnce(
				mockCategoryCreateUseCase,
			);

			await categoryController.create(mockRequest, mockResponse);

			expect(mockCategoryCreateUseCase.execute).toHaveBeenCalledWith(
				mockRequest.body,
			);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Category created successfully',
			});
		});

		it('should return 400 if required data is missing', async () => {
			const mockRequest = {} as Request;
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			} as unknown as Response;

			await categoryController.create(mockRequest, mockResponse);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Missing required data',
			});
		});

		it('should return a list of category', async () => {
			const categoryMock: ICategory[] = [
				{
					id: faker.database.mongodbObjectId(),
					name: faker.string.sample(),
					description: faker.string.sample(),
				},
			];

			const mockCategoryListUseCase = {
				execute: jest.fn().mockReturnValue(categoryMock),
			} as unknown as CategoryListUseCase;

			(container.resolve as jest.Mock).mockReturnValueOnce(
				mockCategoryListUseCase,
			);

			const mockRequest = {} as Request;
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			} as unknown as Response;

			await categoryController.list(mockRequest, mockResponse);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(categoryMock);
		});

		it('should return a category by ID', async () => {
			const categoryMock: ICategory = {
				id: faker.database.mongodbObjectId(),
				name: faker.string.sample(),
				description: faker.string.sample(),
			};

			const mockCategoryFindOneUseCase = {
				execute: jest.fn().mockReturnValue(categoryMock),
			} as unknown as CategoryFindOneUseCase;

			(container.resolve as jest.Mock).mockReturnValueOnce(
				mockCategoryFindOneUseCase,
			);

			const mockRequest = {
				params: {
					id: categoryMock.id,
				},
			};
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			} as unknown as Response;

			await categoryController.findById(
				mockRequest as unknown as Request,
				mockResponse,
			);
			expect(mockCategoryFindOneUseCase.execute).toHaveBeenCalledWith(
				mockRequest.params.id,
			);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(categoryMock);
		});
	});

	it('should delete a category by ID', async () => {
		const mockCategoryDeleteUseCase = {
			execute: jest.fn(),
		} as unknown as CategoryDeleteUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockCategoryDeleteUseCase,
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

		await categoryController.delete(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockCategoryDeleteUseCase.execute).toHaveBeenCalledWith(
			mockRequest.params.id,
		);
		expect(mockResponse.status).toHaveBeenCalledWith(204);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Category deleted successfully',
		});
	});

	it('should update a category by ID', async () => {
		const mockCategoryUpdateUseCase = {
			execute: jest.fn(),
		} as unknown as CategoryUpdateUseCase;

		(container.resolve as jest.Mock).mockReturnValueOnce(
			mockCategoryUpdateUseCase,
		);

		const mockRequest = {
			params: {
				id: faker.database.mongodbObjectId(),
			},
			body: {
				name: faker.string.sample(),
				description: faker.string.sample(),
			},
		};
		const mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		await categoryController.update(
			mockRequest as unknown as Request,
			mockResponse,
		);
		expect(mockCategoryUpdateUseCase.execute).toHaveBeenCalledWith({
			id: mockRequest.params.id,
			params: mockRequest.body,
		});
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			message: 'Category updated successfully',
		});
	});
});
