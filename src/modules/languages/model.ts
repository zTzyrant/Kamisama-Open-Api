import { t } from 'elysia'

export const LanguageModel = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String()
})
export type LanguageModelType = typeof LanguageModel.static

export const CreateLanguageModel = t.Object({
	name: t.String({
		minLength: 2,
		maxLength: 50
	}),
	slug: t.String({
		minLength: 2,
		maxLength: 50
	})
})
export type CreateLanguageModelType = typeof CreateLanguageModel.static

export const UpdateLanguageModel = t.Object({
	name: t.Optional(
		t.String({
			minLength: 2,
			maxLength: 50
		})
	),
	slug: t.Optional(
		t.String({
			minLength: 2,
			maxLength: 50
		})
	)
})
export type UpdateLanguageModelType = typeof UpdateLanguageModel.static

export const GetLanguagesQueryModel = t.Object({
	page: t.Optional(t.Numeric()),
	limit: t.Optional(t.Numeric()),
	search: t.Optional(t.String()),
	sortBy: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('name')]))
})
export type GetLanguagesQueryModelType = typeof GetLanguagesQueryModel.static