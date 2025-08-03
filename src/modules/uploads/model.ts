import { t } from 'elysia'

export const UploadImageModel = t.Object({
	image: t.String()
})

export type UploadImageModelType = typeof UploadImageModel.static
