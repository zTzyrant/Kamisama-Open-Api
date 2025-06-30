import { t } from 'elysia'

export namespace IpaymuVendorModel {
	export const account = t.Object({
		va: t.String(),
		apiKey: t.String()
	})

	export type account = typeof account.static
}

// Ini adalah skema validasi untuk body yang dikirim dari frontend
export const IpaymuPaymentPayloadSchema = t.Object({
	va: t.String({
		minLength: 1,
		error: 'Virtual Account (va) tidak boleh kosong.'
	}),
	apiKey: t.String({ minLength: 1, error: 'API Key tidak boleh kosong.' }),
	body: t.Object({
		product: t.Array(t.String()),
		qty: t.Array(t.String()),
		price: t.Array(t.String()),
		amount: t.String(),
		returnUrl: t.String(),
		cancelUrl: t.String(),
		notifyUrl: t.String(),
		referenceId: t.String(),
		buyerName: t.Optional(t.String()),
		buyerPhone: t.Optional(t.String()),
		buyerEmail: t.Optional(t.String())
	})
})

// Ini adalah tipe TypeScript yang bisa kita gunakan di service
export type IpaymuPaymentPayload = typeof IpaymuPaymentPayloadSchema.static

export const IpaymuDirectPaymentPayloadSchema = t.Object({
	va: t.String({
		minLength: 1,
		error: 'Virtual Account (va) tidak boleh kosong.'
	}),
	apiKey: t.String({ minLength: 1, error: 'API Key tidak boleh kosong.' }),
	body: t.Object({
		name: t.String({ minLength: 3 }),
		phone: t.String(),
		email: t.String({ format: 'email' }),
		amount: t.Number(),
		comments: t.Optional(t.String()),
		notifyUrl: t.String({ format: 'uri' }),
		referenceId: t.String(),
		paymentMethod: t.Enum({
			// Validasi berdasarkan daftar yang Anda berikan
			va: 'va',
			cstore: 'cstore',
			cod: 'cod',
			qris: 'qris',
			cc: 'cc',
			paylater: 'paylater'
		}),
		paymentChannel: t.Enum({
			// Validasi berdasarkan daftar yang Anda berikan
			// VA Channels
			bag: 'bag',
			bca: 'bca',
			bpd_bali: 'bpd_bali',
			bni: 'bni',
			cimb: 'cimb',
			mandiri: 'mandiri',
			bmi: 'bmi',
			bri: 'bri',
			bsi: 'bsi',
			permata: 'permata',
			danamon: 'danamon',
			// CStore Channels
			alfamart: 'alfamart',
			indomaret: 'indomaret',
			// COD Channels
			rpx: 'rpx',
			// QRIS Channels
			mpm: 'mpm',
			// Credit Card
			cc: 'cc',
			// Paylater
			akulaku: 'akulaku'
		}),
		expired: t.Optional(t.Number())
	})
})

// Tipe TypeScript BARU untuk digunakan di service
export type IpaymuDirectPaymentPayload =
	typeof IpaymuDirectPaymentPayloadSchema.static
