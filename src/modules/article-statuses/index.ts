import { Elysia, status as stat } from 'elysia'
import {
	findArticleStatuses,
	getArticleStatusById,
	getArticleStatusBySlug,
	createArticleStatus,
	updateArticleStatus,
	deleteArticleStatus
} from './service'
import {
	CreateArticleStatusModel,
	UpdateArticleStatusModel,
	GetArticleStatusesQueryModel
} from './model'

export const ArticleStatusRoutes = new Elysia({ prefix: '/article-statuses' })
	.get(
		'/',
		async ({ query, status }) => {
			const { articleStatuses, total } = await findArticleStatuses(query)
			return status(200, {
				status: 200,
				message: 'Article statuses retrieved successfully',
				data: articleStatuses,
				pagenation: {
					total
				}
			})
		},
		{
			query: GetArticleStatusesQueryModel,
			detail: {
				tags: ['Article Statuses'],
				summary: 'Get all article statuses',
				description: 'Retrieve a list of all article statuses with optional filtering and pagination.'
			}
		}
	)
	.get(
		'/:id',
		async ({ params: { id }, status }) => {
			const articleStatus = await getArticleStatusById(id)
			if (!articleStatus) {
				return status(404, {
					status: 404,
					message: 'Article status not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Article status retrieved successfully',
				data: articleStatus
			})
		},
		{
			detail: {
				tags: ['Article Statuses'],
				summary: 'Get article status by ID',
				description: 'Retrieve a single article status by its unique ID.'
			}
		}
	)
	.get(
		'/slug/:slug',
		async ({ params: { slug }, status }) => {
			const articleStatus = await getArticleStatusBySlug(slug)
			if (!articleStatus) {
				return status(404, {
					status: 404,
					message: 'Article status not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Article status retrieved successfully',
				data: articleStatus
			})
		},
		{
			detail: {
				tags: ['Article Statuses'],
				summary: 'Get article status by slug',
				description: 'Retrieve a single article status by its unique slug.'
			}
		}
	)
	.post(
		'/',
		async ({ body, status }) => {
			const newArticleStatus = await createArticleStatus(body)
			return status(201, {
				status: 201,
				message: 'Article status created successfully',
				data: newArticleStatus
			})
		},
		{
			auth: { admin: true },
			body: CreateArticleStatusModel,
			detail: {
				tags: ['Article Statuses'],
				summary: 'Create a new article status',
				description: 'Create a new article status. Requires admin role.'
			}
		}
	)
	.put(
		'/:id',
		async ({ params: { id }, body, status }) => {
			const updatedArticleStatus = await updateArticleStatus(id, body)
			if (!updatedArticleStatus) {
				return status(404, {
					status: 404,
					message: 'Article status not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Article status updated successfully',
				data: updatedArticleStatus
			})
		},
		{
			auth: { admin: true },
			body: UpdateArticleStatusModel,
			detail: {
				tags: ['Article Statuses'],
				summary: 'Update an existing article status',
				description: 'Update an existing article status by its ID. Requires admin role.'
			}
		}
	)
	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			await deleteArticleStatus(id)
			return status(200, {
				status: 200,
				message: 'Article status deleted successfully'
			})
		},
		{
			auth: { admin: true },
			detail: {
				tags: ['Article Statuses'],
				summary: 'Delete an article status',
				description: 'Delete an article status by its ID. Requires admin role.'
			}
		}
	)