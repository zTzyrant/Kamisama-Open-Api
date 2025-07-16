import { randomUUID } from 'crypto'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'images')

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
	mkdirSync(UPLOAD_DIR, { recursive: true })
}

export const uploadPhoto = async (base64Image: string) => {
	// Remove data URI prefix if present
	const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

	// Calculate size in bytes (approximate for base64)
	const sizeInBytes = (base64Data.length * 0.75) - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
	const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

	if (sizeInBytes > MAX_SIZE_BYTES) {
		throw new Error('File size exceeds the 2MB limit.');
	}

	// Determine file extension (simple approach, can be improved)
	const mimeType = base64Image.substring('data:image/'.length, base64Image.indexOf(';base64'))
	const extension = mimeType === 'jpeg' ? 'jpg' : mimeType

	const filename = `${randomUUID()}.${extension}`
	const filePath = join(UPLOAD_DIR, filename)
	const imageUrl = `/uploads/images/${filename}` // URL relative to your server

	try {
		writeFileSync(filePath, base64Data, 'base64')
		return { url: imageUrl }
	} catch (error) {
		console.error('Error saving image:', error)
		throw new Error('Failed to save image')
	}
}