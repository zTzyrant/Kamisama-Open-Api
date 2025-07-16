import { Elysia, status as stat } from 'elysia'
import { UploadImageModel } from './model'
import { uploadPhoto } from './service'

export const UploadRoutes = new Elysia({ prefix: '/upload' })
	.post(
		'/photo',
		async ({ body, status }) => {
			try {
				const result = await uploadPhoto(body.image)
				return status(200, {
					status: 200,
					message: 'Image uploaded successfully',
					data: result
				})
			} catch (error: any) {
				return status(500, {
					status: 500,
					message: error.message || 'Failed to upload image'
				})
			}
		},
		{
			body: UploadImageModel,
			detail: {
				tags: ['Uploads'],
				summary: 'Upload Photo',
				description: 'Uploads a photo as a base64 string and returns its URL.'
			}
		}
	)