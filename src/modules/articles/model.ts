import { t } from 'elysia'

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export const ArticleModel = t.Object({
	id: t.String(),
	title: t.String(),
	slug: t.String(),
	content: t.String(),
	excerpt: t.Optional(t.String()),
	coverImage: t.Optional(t.String()),
	status: t.String(), // Tetap string untuk model keluar
	createdAt: t.Date(),
	updatedAt: t.Date(),
	publishedAt: t.Optional(t.Date()),
	authorId: t.String(),
	categoryId: t.String(),
	tagIds: t.Array(t.String())
})
export type ArticleModelType = typeof ArticleModel.static

export const CreateArticleModel = t.Object({
	title: t.String({
		minLength: 3,
		maxLength: 100
	}),
	slug: t.String({
		minLength: 3,
		maxLength: 100
	}),
	content: t.String({
		minLength: 3
	}),
	excerpt: t.Optional(
		t.String({
			minLength: 3,
			maxLength: 255
		})
	),
	coverImage: t.Optional(t.String()),
	status: t.Optional(t.String({ default: 'DRAFT' })),
	categoryId: t.Optional(t.String()),
	tagIds: t.Optional(t.Array(t.String()))
})
export type CreateArticleModel = typeof CreateArticleModel.static

export const UpdateArticleModel = t.Object({
	title: t.Optional(
		t.String({
			minLength: 3,
			maxLength: 100
		})
	),
	slug: t.Optional(
		t.String({
			minLength: 3,
			maxLength: 100
		})
	),
	content: t.Optional(
		t.String({
			minLength: 3
		})
	),
	excerpt: t.Optional(
		t.String({
			minLength: 3,
			maxLength: 255
		})
	),
	coverImage: t.Optional(t.String()),
	status: t.Optional(t.String({ default: 'DRAFT' })),
	categoryId: t.Optional(t.String()),
	tagIds: t.Optional(t.Array(t.String()))
})
export type UpdateArticleModel = typeof UpdateArticleModel.static

export const GetArticlesQueryModel = t.Object({
	page: t.Optional(t.Numeric()),
	limit: t.Optional(t.Numeric()),
	search: t.Optional(t.String()),
	tags: t.Optional(t.String()), // Comma-separated
	category: t.Optional(t.String()),
	sortBy: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('views')])),
	orderBy: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')]))
})
export type GetArticlesQueryModelType = typeof GetArticlesQueryModel.static
