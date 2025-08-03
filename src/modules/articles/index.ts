import { Elysia } from 'elysia'
import type { BetterAuthUser, BetterAuthSession } from '../auth/types'
import { ArticleService } from './service'
import { getArticlePermissions } from './permissions'
import { ArticleModel, SharedModel } from './model'
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
			try {
				const { page = 1, limit = 10, ...filters } = query
				const { articles, total } = await ArticleService.findArticles({
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
					status: 'success',
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
			} catch (error: any) {
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to retrieve articles',
					statusCode: '500'
				})
			}
		},
		{
			query: ArticleModel.query,
			detail: {
				tags: ['Articles'],
				description: 'Get all articles with pagination, filtering, and sorting',
				summary: 'Get all articles',
				responses: {
					200: {
						description:
							'Successful response with a paginated list of articles.',
						content: {
							'application/json': {
								example: {
									status: 'success',
									message: 'Articles retrieved successfully',
									data: [
										{
											id: 'clx123abc456def789',
											title: 'An Awesome Article'
											// ... other fields
										}
									],
									pagination: {
										currentPage: 1,
										totalPages: 10,
										totalItems: 100,
										perPage: 10,
										nextPageUrl: '/articles?page=2&limit=10',
										prevPageUrl: null
									}
								}
							}
						}
					}
				}
			}
		}
	)
	// GET user's articles
	.get(
		'/my-articles',
		async ({ user, query, request, status }) => {
			try {
				const { page = 1, limit = 10, ...filters } = query
				console.log(`user: ${user.id}`)
				const { articles, total } = await ArticleService.findArticles({
					authorId: user.id,
					page,
					limit,
					...filters
				})
				console.log(articles, total)

				const baseUrl = `${request.url.split('?')[0]}`
				const { nextPageUrl, prevPageUrl, totalPages } = buildPaginationUrls(
					baseUrl,
					page,
					limit,
					total,
					query
				)

				return status(200, {
					status: 'success',
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
			} catch (error: any) {
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to retrieve your articles',
					statusCode: '500'
				})
			}
		},
		{
			auth: true, // Requires authentication
			query: ArticleModel.query,
			detail: {
				tags: ['Articles'],
				description:
					'Get all articles authored by the current user with pagination, filtering, and sorting',
				summary: 'Get my articles',
				responses: {
					200: {
						description:
							"Successful response with a paginated list of the user's articles.",
						content: {
							'application/json': {
								example: {
									status: 'success',
									message: 'Your articles retrieved successfully',
									data: [
										/* ... */
									],
									pagination: {
										/* ... */
									}
								}
							}
						}
					},
					401: {
						description:
							'Unauthorized. Missing or invalid authentication token.'
					}
				}
			}
		}
	)
	// GET article by ID
	.get(
		'/:id',
		async ({ params: { id }, user, status }) => {
			try {
				const article = await ArticleService.getArticleById(id)

				const role = user?.role || 'user'
				const permissions = getArticlePermissions(
					{
						id: user?.id || '',
						role: ['admin', 'superAdmin', 'kamisama', 'user'].includes(role)
							? (role as 'admin' | 'superAdmin' | 'kamisama' | 'user')
							: 'user'
					},
					article as any
				)

				return status(200, {
					status: 'success',
					message: 'Article retrieved successfully',
					data: { ...article, permissions }
				})
			} catch (error: any) {
				if (error.message === 'Article not found') {
					return status(404, {
						status: 'error',
						message: 'Article not found',
						statusCode: '404'
					})
				}
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to retrieve article',
					statusCode: '500'
				})
			}
		},
		{
			auth: true, // Requires authentication
			detail: {
				tags: ['Articles'],
				description: 'Get an article by its ID',
				summary: 'Get article by ID',
				responses: {
					200: {
						description: 'Successful response with the full article data.',
						content: {
							'application/json': {
								example: {
									status: 'success',
									message: 'Article retrieved successfully',
									data: {
										id: 'clx123abc456def789',
										// ... other fields
										permissions: {
											canEdit: true,
											canArchive: false,
											canDelete: true
										}
									}
								}
							}
						}
					},
					401: {
						description: 'Unauthorized.'
					},
					404: {
						description: 'Article not found.'
					}
				}
			}
		}
	)
	// GET articles by status slug
	.get(
		'/status/:statusSlug',
		async ({ params: { statusSlug }, query, request, status }) => {
			try {
				const { page = 1, limit = 10, ...filters } = query

				const articleStatus = await getArticleStatusBySlug(statusSlug)
				if (!articleStatus) {
					return status(400, {
						status: 'error',
						message: 'Invalid article status slug',
						statusCode: '400'
					})
				}

				const { articles, total } = await ArticleService.findArticles({
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
					status: 'success',
					message: `Articles with status ${articleStatus.name} retrieved successfully`,
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
			} catch (error: any) {
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to retrieve articles by status',
					statusCode: '500'
				})
			}
		},
		{
			query: ArticleModel.query,
			detail: {
				tags: ['Articles'],
				description:
					'Get articles by status slug with pagination, filtering, and sorting',
				summary: 'Get articles by status slug',
				responses: {
					200: {
						description:
							'Successful response with a paginated list of articles.'
					},
					400: {
						description: 'Invalid article status slug.'
					}
				}
			}
		}
	)
	// GET articles by language slug
	.get(
		'/lang/:langSlug',
		async ({ params: { langSlug }, query, request, status }) => {
			try {
				const { page = 1, limit = 10, ...filters } = query

				const language = await getLanguageBySlug(langSlug)
				if (!language) {
					return status(400, {
						status: 'error',
						message: 'Invalid language slug',
						statusCode: '400'
					})
				}

				const { articles, total } = await ArticleService.findArticles({
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
					status: 'success',
					message: `Articles in language ${language.name} retrieved successfully`,
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
			} catch (error: any) {
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to retrieve articles by language',
					statusCode: '500'
				})
			}
		},
		{
			query: ArticleModel.query,
			detail: {
				tags: ['Articles'],
				description:
					'Get articles by language slug with pagination, filtering, and sorting',
				summary: 'Get articles by language slug',
				responses: {
					200: {
						description:
							'Successful response with a paginated list of articles.'
					},
					400: {
						description: 'Invalid language slug.'
					}
				}
			}
		}
	)
	// GET article by slug (no auth required)
	.get(
		'/slug/:slug',
		async ({ params: { slug }, request, user, status }) => {
			try {
				const article = await ArticleService.getArticleBySlug(slug)

				const viewerIp =
					request.headers.get('x-forwarded-for') ||
					request.headers.get('x-real-ip') ||
					'0.0.0.0'
				const userAgent = request.headers.get('user-agent') || undefined
				const referer = request.headers.get('referer') || undefined

				await ArticleService.recordArticleView(
					article.id,
					viewerIp,
					userAgent,
					referer,
					user?.id
				)

				return status(200, {
					status: 'success',
					message: 'Article retrieved successfully',
					data: article
				})
			} catch (error: any) {
				if (error.message === 'Article not found') {
					return status(404, {
						status: 'error',
						message: 'Article not found',
						statusCode: '404'
					})
				}
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to retrieve article',
					statusCode: '500'
				})
			}
		},
		{
			detail: {
				tags: ['Articles'],
				description: 'Get an article by its slug',
				summary: 'Get article by slug',
				responses: {
					200: {
						description: 'Successful response with the full article data.'
					},
					404: {
						description: 'Article not found.'
					}
				}
			}
		}
	)
	// POST create new article
	.post(
		'/',
		async ({ body, user, status }) => {
			try {
				const newArticle = await ArticleService.createArticle(body, user.id)
				return status(201, {
					status: 'success',
					message: 'Article created successfully',
					data: newArticle
				})
			} catch (error: any) {
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to create article',
					statusCode: '500'
				})
			}
		},
		{
			auth: true, // Requires authentication
			body: ArticleModel.create,
			detail: {
				tags: ['Articles'],
				description: 'Create a new article',
				summary: 'Create article',
				responses: {
					201: {
						description: 'Article created successfully.',
						content: {
							'application/json': {
								example: {
									status: 'success',
									message: 'Article created successfully',
									data: {
										id: 'clx123abc456def789',
										title: 'My New Awesome Article',
										slug: 'my-new-awesome-article-2025-08-02',
										content: '...'
										// ... other fields
									}
								}
							}
						}
					},
					400: {
						description: 'Validation error.',
						content: {
							'application/json': {
								example: {
									status: 'error',
									message: 'Validation failed',
									statusCode: '400',
									errors: [
										{
											field: 'title',
											code: 'article.title.length'
										}
									]
								}
							}
						}
					},
					401: {
						description:
							'Unauthorized. Missing or invalid authentication token.',
						content: {
							'application/json': {
								example: {
									status: 'error',
									message: 'Unauthorized',
									statusCode: '401'
								}
							}
						}
					}
				}
			},
			error({ code, error, set }) {
				if (code === 'VALIDATION') {
					set.status = 400
					return {
						status: 'error',
						message: 'Validation failed',
						statusCode: '400',
						errors: error.all.map((err: any) => ({
							field: err.path.replace('/', ''),
							code: err.schema.errors ? err.schema.errors : err.schema.error
						}))
					}
				}
			}
		}
	)
	// PUT update article
	.put(
		'/:id',
		async ({ params: { id }, body, user, status }) => {
			try {
				const updatedArticle = await ArticleService.updateArticle(
					id,
					body,
					user as any
				)
				return status(200, {
					status: 'success',
					message: 'Article updated successfully',
					data: updatedArticle
				})
			} catch (error: any) {
				if (error.message === 'Article not found') {
					return status(404, {
						status: 'error',
						message: 'Article not found',
						statusCode: '404'
					})
				}
				if (error.message.includes('Forbidden')) {
					return status(403, {
						status: 'error',
						message: error.message,
						statusCode: '403'
					})
				}
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to update article',
					statusCode: '500'
				})
			}
		},
		{
			auth: true, // Requires authentication
			body: ArticleModel.update,
			detail: {
				tags: ['Articles'],
				description: 'Update an existing article',
				summary: 'Update article',
				responses: {
					200: {
						description: 'Article updated successfully.',
						content: {
							'application/json': {
								example: {
									status: 'success',
									message: 'Article updated successfully',
									data: {
										id: 'clx123abc456def789',
										title: 'My Updated Awesome Article',
										slug: 'my-updated-awesome-article-2025-08-02',
										content: '...'
										// ... other fields
									}
								}
							}
						}
					},
					400: {
						description: 'Validation error.',
						content: {
							'application/json': {
								example: {
									status: 'error',
									message: 'Validation failed',
									statusCode: '400',
									errors: [
										{
											field: 'title',
											code: 'article.title.length'
										}
									]
								}
							}
						}
					},
					403: {
						description: 'Forbidden. User does not have permission.',
						content: {
							'application/json': {
								example: {
									status: 'error',
									message:
										'Forbidden: You do not have permission to edit this article.',
									statusCode: '403'
								}
							}
						}
					},
					404: {
						description: 'Article not found.',
						content: {
							'application/json': {
								example: {
									status: 'error',
									message: 'Article not found',
									statusCode: '404'
								}
							}
						}
					}
				}
			},
			error({ code, error, set }) {
				if (code === 'VALIDATION') {
					set.status = 400;
					console.log(error.all);
					return {
						status: 'error',
						message: 'Validation failed',
						statusCode: '400',
						errors: error.all.map((err: any) => ({
							field: err.path.replace('/', ''),
							code: Array.isArray(err.schema.error)
								? err.schema.error.toString()
								: err.schema.error
						}))
					};
				}
			}
		}
	)
	// DELETE article
	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			try {
				await ArticleService.deleteArticle(id)
				return status(200, {
					status: 'success',
					message: 'Article deleted successfully'
				})
			} catch (error: any) {
				if (error.message === 'Article not found') {
					return status(404, {
						status: 'error',
						message: 'Article not found',
						statusCode: '404'
					})
				}
				return status(500, {
					status: 'error',
					message: error.message || 'Failed to delete article',
					statusCode: '500'
				})
			}
		},
		{
			auth: true, // Requires authentication
			detail: {
				tags: ['Articles'],
				description: 'Delete an article',
				summary: 'Delete article'
			}
		}
	)
