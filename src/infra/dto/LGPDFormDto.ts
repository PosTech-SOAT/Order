export interface LGPDFormDto {
	userId: string;
	name: string;
	address: string;
	phone: string;
	exclusion: boolean;
}

export enum LGPDStatusExecution {
	SUCCESS = 'SUCCESS',
	FAILED = 'FAILED',
}
