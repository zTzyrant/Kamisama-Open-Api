import { Elysia, status as stat } from 'elysia'
import type { BetterAuthUser, BetterAuthSession } from '../auth/types'
import {
	findArticles,
	getArticleById,
	createArticle,
	updateArticle,
	deleteArticle,
	getArticleBySlug,
	recordArticleView
} from './service'
import {
	CreateArticleModel,
	UpdateArticleModel,
	GetArticlesQueryModel
} from './model'

import { getArticleStatusBySlug } from '../article-statuses/service'
import { getLanguageBySlug } from '../languages/service'

// Helper to construct pagination URLs
const buildPaginationUrls = (
	baseUrl: string,
	page: number,
	limit: number,
	total: number,
	query: Record<string, any>
) => {
	const totalPages = Math.ceil(total / limit)
	const filteredQuery = { ...query }
	delete filteredQuery.page

	const queryString = new URLSearchParams(filteredQuery as any).toString()

	const nextPage = page < totalPages ? page + 1 : null
	const prevPage = page > 1 ? page - 1 : null

	const nextPageUrl = nextPage
		? `${baseUrl}?page=${nextPage}&${queryString}`
		: null
	const prevPageUrl = prevPage
		? `${baseUrl}?page=${prevPage}&${queryString}`
		: null

	return { nextPageUrl, prevPageUrl, totalPages }
}

export const ArticleRoutes = new Elysia({ prefix: '/articles' })
	.derive(() => {
		return {
			user: null as unknown as BetterAuthUser,
			session: null as unknown as BetterAuthSession
		}
	})
	// GET all articles with pagination, filtering, and sorting
	.get(
		'/',
		async ({ query, request, status }) => {
			const { page = 1, limit = 10, ...filters } = query
			const { articles, total } = await findArticles({
				page,
				limit,
				...filters
			})

			const baseUrl = `${request.url.split('?')[0]}`
			const { nextPageUrl, prevPageUrl, totalPages } = buildPaginationUrls(
				baseUrl,
				page,
				limit,
				total,
				query
			)

			return status(200, {
				status: 200,
				message: 'Articles retrieved successfully',
				data: articles,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems: total,
					perPage: limit,
					nextPageUrl,
					prevPageUrl
				}
			})
		},
		{
			query: GetArticlesQueryModel,
			detail: {
				tags: ['Articles'],
				description: 'Get all articles with pagination, filtering, and sorting',
				summary: 'Get all articles',
				query: {
					page: {
						description: 'The page number to retrieve.',
						example: 1
					},
					limit: {
						description: 'The number of items to retrieve per page.',
						example: 10
					},
					search: {
						description:
							'A search term to filter articles by title, content, or excerpt.',
						example: 'Technology'
					},
					tags: {
						description:
							'A comma-separated list of tag IDs to filter articles by.',
						example: 'tagId1,tagId2'
					},
					category: {
						description: 'A category ID to filter articles by.',
						example: 'categoryId1'
					},
					statusId: {
						description: 'An article status ID to filter articles by.',
						example: 'statusId1'
					},
					langId: {
						description: 'A language ID to filter articles by.',
						example: 'langId1'
					},
					sortBy: {
						description: 'The field to sort the articles by.',
						example: 'createdAt'
					},
					orderBy: {
						description: 'The order to sort the articles in.',
						example: 'desc'
					}
				}
			}
		}
	)
	// GET user's articles
	.get(
		'/my-articles',
		async ({ user, query, request, status }) => {
			const { page = 1, limit = 10, ...filters } = query
			const { articles, total } = await findArticles({
				authorId: user.id,
				page,
				limit,
				...filters
			})

			const baseUrl = `${request.url.split('?')[0]}`
			const { nextPageUrl, prevPageUrl, totalPages } = buildPaginationUrls(
				baseUrl,
				page,
				limit,
				total,
				query
			)

			return status(200, {
				status: 200,
				message: 'Your articles retrieved successfully',
				data: articles,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems: total,
					perPage: limit,
					nextPageUrl,
					prevPageUrl
				}
			})
		},
		{
			auth: true,
			query: GetArticlesQueryModel,
			detail: {
				tags: ['Articles'],
				description:
					'Get all articles authored by the current user with pagination, filtering, and sorting',
				summary: 'Get my articles',
				query: {
					page: {
						description: 'The page number to retrieve.',
						example: 1
					},
					limit: {
						description: 'The number of items to retrieve per page.',
						example: 10
					},
					search: {
							description:
							'A search term to filter articles by title, content, or excerpt.',
						example: 'Technology'
					},
					tags: {
						description:
							'A comma-separated list of tag IDs to filter articles by.',
						example: 'tagId1,tagId2'
					},
					category: {
						description: 'A category ID to filter articles by.',
						example: 'categoryId1'
					},
					statusId: {
						description: 'An article status ID to filter articles by.',
						example: 'statusId1'
					},
					langId: {
						description: 'A language ID to filter articles by.',
						example: 'langId1'
					},
					sortBy: {
						description: 'The field to sort the articles by.',
						example: 'createdAt'
					},
					orderBy: {
						description: 'The order to sort the articles in.',
						example: 'desc'
					}
				}
			}
		}
	)
	// GET article by ID
	.get(
		'/:id',
		async ({ params: { id }, status }) => {
			const article = await getArticleById(id)
			if (!article) {
				return status(404, {
					status: 404,
					message: 'Article not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Article retrieved successfully',
				data: article
			})
		},
		{
			detail: {
				tags: ['Articles'],
				description: 'Get an article by its ID',
				summary: 'Get article by ID'
			}
		}
	)
	
	// GET articles by status slug
	.get(
		'/status/:statusSlug',
		async ({ params: { statusSlug }, query, request, status }) => {
			const { page = 1, limit = 10, ...filters } = query

			const articleStatus = await getArticleStatusBySlug(statusSlug)
			if (!articleStatus) {
				return status(400, {
					status: 400,
					message: 'Invalid article status slug'
				})
			}

			const { articles, total } = await findArticles({
				page,
				limit,
				statusId: articleStatus.id,
				...filters
			})

			const baseUrl = `${request.url.split('?')[0]}`
			const { nextPageUrl, prevPageUrl, totalPages } = buildPaginationUrls(
				baseUrl,
				page,
				limit,
				total,
				query
			)

			return status(200, {
				status: 200,
				message: `Articles with status ${articleStatus.name} retrieved successfully`,
				data: articles,
				pagenation: {
					currentPage: page,
					totalPages,
					totalItems: total,
					perPage: limit,
					nextPageUrl,
					prevPageUrl
				}
			})
		},
		{
			query: GetArticlesQueryModel,
			detail: {
				tags: ['Articles'],
				description:
					'Get articles by status slug with pagination, filtering, and sorting',
				summary: 'Get articles by status slug',
				params: {
					statusSlug: {
						type: 'string',
						description: 'The slug of the article status to retrieve (e.g., draft, published, archived)',
						example: 'published'
					}
				},
				query: {
					page: {
						description: 'The page number to retrieve.',
						example: 1
					},
					limit: {
						description: 'The number of items to retrieve per page.',
						example: 10
					},
					search: {
							description:
							'A search term to filter articles by title, content, or excerpt.',
						example: 'Technology'
					},
					tags: {
							description:
							'A comma-separated list of tag IDs to filter articles by.',
						example: 'tagId1,tagId2'
					},
					category: {
						description: 'A category ID to filter articles by.',
						example: 'categoryId1'
					},
					statusId: {
						description: 'An article status ID to filter articles by.',
						example: 'statusId1'
					},
					langId: {
						description: 'A language ID to filter articles by.',
						example: 'langId1'
					},
					sortBy: {
						description: 'The field to sort the articles by.',
						example: 'createdAt'
					},
					orderBy: {
						description: 'The order to sort the articles in.',
						example: 'desc'
					}
				}
			}
		}
	)
	// GET articles by language slug
	.get(
		'/lang/:langSlug',
		async ({ params: { langSlug }, query, request, status }) => {
			const { page = 1, limit = 10, ...filters } = query

			const language = await getLanguageBySlug(langSlug)
			if (!language) {
				return status(400, {
					status: 400,
					message: 'Invalid language slug'
				})
			}

			const { articles, total } = await findArticles({
				page,
				limit,
				langId: language.id,
				...filters
			})

			const baseUrl = `${request.url.split('?')[0]}`
			const { nextPageUrl, prevPageUrl, totalPages } = buildPaginationUrls(
				baseUrl,
				page,
				limit,
				total,
				query
			)

			return status(200, {
				status: 200,
				message: `Articles in language ${language.name} retrieved successfully`,
				data: articles,
				pagenation: {
					currentPage: page,
					totalPages,
					totalItems: total,
					perPage: limit,
					nextPageUrl,
					prevPageUrl
				}
			})
		},
		{
			query: GetArticlesQueryModel,
			detail: {
				tags: ['Articles'],
				description:
					'Get articles by language slug with pagination, filtering, and sorting',
				summary: 'Get articles by language slug',
				params: {
					langSlug: {
						type: 'string',
						description: 'The slug of the language to retrieve (e.g., en, id)',
						example: 'en'
					}
				},
				query: {
					page: {
						description: 'The page number to retrieve.',
						example: 1
					},
					limit: {
						description: 'The number of items to retrieve per page.',
						example: 10
					},
					search: {
							description:
							'A search term to filter articles by title, content, or excerpt.',
						example: 'Technology'
					},
					tags: {
							description:
							'A comma-separated list of tag IDs to filter articles by.',
						example: 'tagId1,tagId2'
					},
					category: {
						description: 'A category ID to filter articles by.',
						example: 'categoryId1'
					},
					sortBy: {
						description: 'The field to sort the articles by.',
						example: 'createdAt'
					},
					orderBy: {
						description: 'The order to sort the articles in.',
						example: 'desc'
					}
				}
			}
		}
	)
	// GET article by slug
	.get(
		'/slug/:slug',
		async ({ params: { slug }, status, request, user }) => {
			const article = await getArticleBySlug(slug)
			if (!article) {
				return status(404, {
					status: 404,
					message: 'Article not found'
				})
			}

			const viewerIp =
				request.headers.get('x-forwarded-for') ||
				request.headers.get('x-real-ip') ||
				'0.0.0.0'
			const userAgent = request.headers.get('user-agent') || undefined
			const referer = request.headers.get('referer') || undefined
			await recordArticleView(
				article.id,
				viewerIp,
				userAgent,
				referer,
				user?.id
			)

			return status(200, {
				status: 200,
				message: 'Article retrieved successfully',
				data: article
			})
		},
		{
			detail: {
				tags: ['Articles'],
				description: 'Get an article by its slug',
				summary: 'Get article by slug'
			}
		}
	)
	// POST create new article
	.post(
		'/',
		async ({ body, user, status }) => {
			const newArticle = await createArticle(body, user.id)
			return status(201, {
				status: 201,
				message: 'Article created successfully',
				data: newArticle
			})
		},
		{
			auth: true,
			body: CreateArticleModel,
			detail: {
				tags: ['Articles'],
				description: 'Create a new article',
				summary: 'Create article'
			}
		}
	)
	// PUT update article
	.put(
		'/:id',
		async ({ params: { id }, body, status }) => {
			const updatedArticle = await updateArticle(id, body)
			if (!updatedArticle) {
				return status(404, {
					status: 404,
					message: 'Article not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Article updated successfully',
				data: updatedArticle
			})
		},
		{
			auth: true,
			body: UpdateArticleModel,
			detail: {
				tags: ['Articles'],
				description: 'Update an existing article',
				summary: 'Update article'
			}
		}
	)
	// DELETE article
	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			await deleteArticle(id)
			return status(200, {
				status: 200,
				message: 'Article deleted successfully'
			})
		},
		{
			auth: true,
			detail: {
				tags: ['Articles'],
				description: 'Delete an article',
				summary: 'Delete article'
			}
		}
	)