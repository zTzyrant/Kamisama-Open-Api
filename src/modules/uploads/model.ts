import { t } from 'elysia'

export const UploadImageModel = t.Object({
	image: t.String({ format: 'base64' })
})

export type UploadImageModelType = typeof UploadImageModel.static