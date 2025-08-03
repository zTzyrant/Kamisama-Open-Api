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
				description: 'Uploads a photo as a base64 string. Returns both a relative path for database storage and a full URL for immediate preview.',
				responses: {
					200: {
						description: 'Image uploaded successfully.',
						content: {
							'application/json': {
								example: {
									status: 200,
									message: 'Image uploaded successfully',
									data: {
										path: '/uploads/images/your-image-uuid.jpg',
										url: 'http://localhost:3000/uploads/images/your-image-uuid.jpg'
									}
								}
							}
						}
					}
				}
			}
		}
	)