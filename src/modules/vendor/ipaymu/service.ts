import { status } from 'elysia'
import axios from 'axios'
import { generateIpaymuSignature } from '../../../utils/signature'
import { paymentOptions } from '../../../data/ipaymu'

import { IpaymuPaymentPayload, IpaymuDirectPaymentPayload } from './model'

const IPAYMU_SANDBOX_URL = 'https://sandbox.ipaymu.com/api/v2'

export abstract class IpaymuVendorService {
	static async getHealthCheck() {
		try {
			const { signature, timestamp } = generateIpaymuSignature(
				process.env.IPAYMU_VA!,
				process.env.IPAYMU_API_KEY!,
				{},
				'GET'
			)
			const response = await axios.get(
				IPAYMU_SANDBOX_URL + '/payment-channels',
				{
					headers: {
						'Content-Type': 'application/json',
						va: process.env.IPAYMU_VA!,
						signature: signature!,
						timestamp: timestamp!
					}
				}
			)

			return status(200, {
				status: 200,
				message: 'Ipaymu vendor is running',
				data: response.data
			})
		} catch (error) {
			console.log(error)
			return status(500, {
				status: 500,
				message: 'Ipaymu vendor is not running'
			})
		}
	}

	static async postPaymentPage(payload: IpaymuPaymentPayload) {
		try {
			const { va, apiKey, body } = payload

			// 1. Generate signature on the backend using the received data
			const { signature, timestamp } = generateIpaymuSignature(
				va,
				apiKey,
				body,
				'POST'
			)

			// 2. Make the request to the iPaymu API
			const response = await axios.post(
				IPAYMU_SANDBOX_URL + '/payment', // Use production URL when live
				body, // The body from frontend is the body for iPaymu
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						va: va,
						signature: signature,
						timestamp: timestamp
					}
				}
			)

			// 3. Return a successful response to our frontend
			return {
				status: response.data?.Status || 200,
				message:
					response.data?.Message || 'Payment request processed successfully',
				data: response.data?.Data
			}
		} catch (error: any) {
			console.error('[IpaymuService Error]', error)

			// Extract error message from iPaymu if available
			const errorMessage =
				error.response?.data?.Message ||
				error.message ||
				'An unknown error occurred.'
			const errorStatus = error.response?.data?.Status || 500

			// 4. Return a structured error to our frontend
			return status(errorStatus, {
				status: errorStatus,
				message: errorMessage,
				error: error.response?.data || null
			})
		}
	}

	static async postDirectPayment(payload: IpaymuDirectPaymentPayload) {
		try {
			const { va, apiKey, body } = payload

			// 1. Generate signature, logikanya sama persis
			const { signature, timestamp } = generateIpaymuSignature(
				va,
				apiKey,
				body,
				'POST'
			)

			// 2. Kirim request ke endpoint iPaymu DIRECT PAYMENT
			const response = await axios.post(
				IPAYMU_SANDBOX_URL + '/payment/direct', // Gunakan URL Direct Payment
				body,
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						va: va,
						signature: signature,
						timestamp: timestamp
					}
				}
			)

			// 3. Kembalikan respons sukses ke frontend kita
			return {
				status: response.data?.Status || 200,
				message:
					response.data?.Message ||
					'Direct payment request processed successfully',
				data: response.data?.Data
			}
		} catch (error: any) {
			console.error('[IpaymuDirectService Error]', error)

			const errorMessage =
				error.response?.data?.Message ||
				error.message ||
				'An unknown error occurred.'
			const errorStatus = error.response?.data?.Status || 500

			// 4. Kembalikan error terstruktur ke frontend kita
			return status(errorStatus, {
				status: errorStatus,
				message: errorMessage,
				error: error.response?.data || null
			})
		}
	}

	static async getPaymentOptions() {
		return {
			status: 200,
			message: 'Payment options retrieved successfully',
			data: paymentOptions
		}
	}
}
