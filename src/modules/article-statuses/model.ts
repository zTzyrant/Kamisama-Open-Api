import { t } from 'elysia'

export const ArticleStatusModel = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String()
})
export type ArticleStatusModelType = typeof ArticleStatusModel.static

export const CreateArticleStatusModel = t.Object({
	name: t.String({
		minLength: 2,
		maxLength: 50
	}),
	slug: t.String({
		minLength: 2,
		maxLength: 50
	})
})
export type CreateArticleStatusModelType = typeof CreateArticleStatusModel.static

export const UpdateArticleStatusModel = t.Object({
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
export type UpdateArticleStatusModelType = typeof UpdateArticleStatusModel.static

export const GetArticleStatusesQueryModel = t.Object({
	page: t.Optional(t.Numeric()),
	limit: t.Optional(t.Numeric()),
	search: t.Optional(t.String()),
	sortBy: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('name')]))
})
export type GetArticleStatusesQueryModelType = typeof GetArticleStatusesQueryModel.static