import { Elysia } from 'elysia'
import { IpaymuVendorService } from './service'
import {
	IpaymuPaymentPayloadSchema,
	IpaymuDirectPaymentPayloadSchema
} from './model'

export const ipaymuVendor = new Elysia({ prefix: '/public/vendor/ipaymu' })
	.get(
		'/status',
		({ status }) => {
			return IpaymuVendorService.getHealthCheck()
		},
		{
			detail: {
				tags: ['Payment'],
				summary: 'Check iPaymu Vendor Status',
				description: 'Check the status of the iPaymu vendor.'
			}
		}
	)
	.post(
		'/payment',
		async ({ body, set }) => {
			const response = await IpaymuVendorService.postPaymentPage(body)

			// Mengatur status HTTP berdasarkan respons dari service
			if ('status' in response) {
				set.status = response.status
			}

			return response
		},
		{
			// Validasi payload yang masuk menggunakan skema dari model
			body: IpaymuPaymentPayloadSchema,
			detail: {
				summary: 'Process iPaymu Payment',
				description:
					'Receives payment data from the frontend, generates a signature, and forwards the request to iPaymu.',
				tags: ['Payment']
			}
		}
	)
	.post(
		'/payment/direct',
		async ({ body, set }) => {
			const response = await IpaymuVendorService.postDirectPayment(body)
			// Mengatur status HTTP berdasarkan respons dari service
			if ('status' in response) {
				set.status = response.status
			}
			return response
		},
		{
			// Gunakan skema validasi untuk Direct Payment
			body: IpaymuDirectPaymentPayloadSchema,
			detail: {
				summary: 'Process iPaymu Direct Payment',
				description:
					'Creates a direct payment transaction (e.g., generates a VA number).',
				tags: ['Payment']
			}
		}
	)
	.get(
		'/payment/options', // URL: GET /req/payment/options
		async () => {
			return await IpaymuVendorService.getPaymentOptions()
		},
		{
			detail: {
				summary: 'List Payment Options',
				description:
					'Get a structured list of all available payment methods and their corresponding channels.',
				tags: ['Payment']
			}
		}
	)
