import CryptoJS from 'crypto-js'

export const generateIpaymuSignature = (
	va: string,
	apiKey: string,
	body: object,
	method: 'POST' | 'GET' = 'POST'
): { signature: string; timestamp: string } => {
	const now = new Date()
	const timestamp = now
		.toISOString()
		.replace(/[^0-9]/g, '')
		.slice(0, -3)
	const bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body)).toString(
		CryptoJS.enc.Hex
	)

	const stringToSign = `${method}:${va}:${bodyEncrypt}:${apiKey}`

	const signature = CryptoJS.enc.Hex.stringify(
		CryptoJS.HmacSHA256(stringToSign, apiKey)
	)

	return { signature, timestamp }
}
