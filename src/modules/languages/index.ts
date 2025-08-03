import { Elysia, status as stat } from 'elysia'
import {
	findLanguages,
	getLanguageById,
	getLanguageBySlug,
	createLanguage,
	updateLanguage,
	deleteLanguage
} from './service'
import {
	CreateLanguageModel,
	UpdateLanguageModel,
	GetLanguagesQueryModel
} from './model'

export const LanguageRoutes = new Elysia({ prefix: '/languages' })
	.get(
		'/',
		async ({ query, status }) => {
			const { languages, total } = await findLanguages(query)
			return status(200, {
				status: 200,
				message: 'Languages retrieved successfully',
				data: languages,
				pagenation: {
					total
				}
			})
		},
		{
			query: GetLanguagesQueryModel,
			detail: {
				tags: ['Languages'],
				summary: 'Get all languages',
				description: 'Retrieve a list of all languages with optional filtering and pagination.'
			}
		}
	)
	.get(
		'/:id',
		async ({ params: { id }, status }) => {
			const language = await getLanguageById(id)
			if (!language) {
				return status(404, {
					status: 404,
					message: 'Language not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Language retrieved successfully',
				data: language
			})
		},
		{
			detail: {
				tags: ['Languages'],
				summary: 'Get language by ID',
				description: 'Retrieve a single language by its unique ID.'
			}
		}
	)
	.get(
		'/slug/:slug',
		async ({ params: { slug }, status }) => {
			const language = await getLanguageBySlug(slug)
			if (!language) {
				return status(404, {
					status: 404,
					message: 'Language not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Language retrieved successfully',
				data: language
			})
		},
		{
			detail: {
				tags: ['Languages'],
				summary: 'Get language by slug',
				description: 'Retrieve a single language by its unique slug.'
			}
		}
	)
	.post(
		'/',
		async ({ body, status }) => {
			const newLanguage = await createLanguage(body)
			return status(201, {
				status: 201,
				message: 'Language created successfully',
				data: newLanguage
			})
		},
		{
			auth: { admin: true },
			body: CreateLanguageModel,
			detail: {
				tags: ['Languages'],
				summary: 'Create a new language',
				description: 'Create a new language. Requires admin role.'
			}
		}
	)
	.put(
		'/:id',
		async ({ params: { id }, body, status }) => {
			const updatedLanguage = await updateLanguage(id, body)
			if (!updatedLanguage) {
				return status(404, {
					status: 404,
					message: 'Language not found'
				})
			}
			return status(200, {
				status: 200,
				message: 'Language updated successfully',
				data: updatedLanguage
			})
		},
		{
			auth: { admin: true },
			body: UpdateLanguageModel,
			detail: {
				tags: ['Languages'],
				summary: 'Update an existing language',
				description: 'Update an existing language by its ID. Requires admin role.'
			}
		}
	)
	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			await deleteLanguage(id)
			return status(200, {
				status: 200,
				message: 'Language deleted successfully'
			})
		},
		{
			auth: { admin: true },
			detail: {
				tags: ['Languages'],
				summary: 'Delete a language',
				description: 'Delete a language by its ID. Requires admin role.'
			}
		}
	)