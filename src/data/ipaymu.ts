export interface PaymentChannel {
	code: string
	name: string
}

export interface PaymentMethod {
	code: string
	name: string
	channels: PaymentChannel[]
}

// Ini adalah sumber data utama kita
export const paymentOptions: PaymentMethod[] = [
	{
		code: 'va',
		name: 'Virtual Account',
		channels: [
			{ code: 'bca', name: 'BCA Virtual Account' },
			{ code: 'bri', name: 'BRI Virtual Account' },
			{ code: 'bni', name: 'BNI Virtual Account' },
			{ code: 'mandiri', name: 'Mandiri Virtual Account' },
			{ code: 'cimb', name: 'Cimb Niaga Virtual Account' },
			{ code: 'bsi', name: 'BSI Virtual Account' },
			{ code: 'permata', name: 'Permata Virtual Account' },
			{ code: 'danamon', name: 'Danamon Virtual Account' },
			{ code: 'bmi', name: 'Muamalat Virtual Account' },
			{ code: 'bpd_bali', name: 'BPD Bali Virtual Account' },
			{ code: 'bag', name: 'BAG Virtual Account' }
		]
	},
	{
		code: 'cstore',
		name: 'Convenience Store',
		channels: [
			{ code: 'indomaret', name: 'Indomaret' },
			{ code: 'alfamart', name: 'Alfamart' }
		]
	},
	{
		code: 'qris',
		name: 'QRIS',
		channels: [{ code: 'mpm', name: 'QRIS (MPM)' }]
	},
	{
		code: 'cod',
		name: 'Cash On Delivery',
		channels: [{ code: 'rpx', name: 'COD by RPX' }]
	},
	{
		code: 'cc',
		name: 'Credit Card',
		channels: [{ code: 'cc', name: 'Credit Card' }]
	},
	{
		code: 'paylater',
		name: 'Pay Later',
		channels: [{ code: 'akulaku', name: 'Akulaku' }]
	}
]
