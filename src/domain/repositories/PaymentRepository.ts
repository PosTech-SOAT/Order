import { OrderDto } from '../../infra/dto/OrderDto';
import { IPaymentRepository } from '../interfaces/repositories/IPaymentRepository';
import axios from 'axios';

const GENERIC_ERROR_MESSAGE =
	'Ocorreu um erro ao tentar gerar o link de pagamento!';

export class PaymentRepository implements IPaymentRepository {
	async CreatePayment(order: OrderDto | null) {
		if (order) {
			try {
				const { payment_url } = (
					await axios.post(`${process.env.PAYMENT_URL}/api/payment`, order)
				).data;
				return payment_url;
			} catch (error) {
				console.log('payment url: ', process.env.PAYMENT_URL);
				console.log('payment error: ', error);
				throw new Error(GENERIC_ERROR_MESSAGE);
			}
		}
		throw new Error(GENERIC_ERROR_MESSAGE);
	}
}
