module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
		'^.+\\.jsx?$': 'babel-jest', // Adicione esta linha para suportar arquivos JavaScript
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json',
			isolatedModules: true,
		},
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	collectCoverageFrom: [
		'src/infra/controllers/**/*',
		'!src/infra/controllers/container/**/*',
		'!src/infra/controllers/ClientController.*',
	],
	coverageThreshold: {
		global: {
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
};
