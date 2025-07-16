import { PrismaClient, Prisma } from '@prisma/client'
import type { CreateArticleModel, UpdateArticleModel } from './model'

const prisma = new PrismaClient()

interface GetArticlesOptions {
	page?: number
	limit?: number
	search?: string
	tags?: string // comma-separated tag IDs
	category?: string // category ID
	status?: string // Add status filter
	sortBy?: 'createdAt' | 'views'
	orderBy?: 'asc' | 'desc'
	authorId?: string
}

// A single function to get articles with all the filters and options
export const findArticles = async (options: GetArticlesOptions) => {
	const {
		page = 1,
		limit = 10,
		search,
		tags,
		category,
		status,
		sortBy = 'createdAt',
		orderBy = 'desc',
		authorId
	} = options

	const skip = (page - 1) * limit

	const where: Prisma.ArticleWhereInput = {}

	if (authorId) {
		where.authorId = authorId
	}

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: 'insensitive' } },
			{ content: { contains: search, mode: 'insensitive' } },
			{ excerpt: { contains: search, mode: 'insensitive' } }
		]
	}

	if (category) {
		where.categoryId = category
	}

	if (tags) {
		// Assuming tags are provided as a comma-separated string of tag IDs
		where.tags = {
			some: {
				id: {
					in: tags
						.split(',')
						.map((tag) => tag.trim())
						.filter(Boolean)
				}
			}
		}
	}

	if (status) {
		where.status = status
	}

	const orderByClause: Prisma.ArticleOrderByWithRelationInput = {}

	if (sortBy === 'views') {
		orderByClause.views = {
			_count: orderBy
		}
	} else {
		orderByClause.createdAt = orderBy
	}

	const [articlesData, total] = await prisma.$transaction([
		prisma.article.findMany({
			where,
			skip,
			take: limit,
			orderBy: orderByClause,
			include: {
				author: {
					select: { id: true, name: true, image: true }
				},
				category: {
					select: { id: true, name: true, slug: true }
				},
				tags: {
					select: { id: true, name: true, slug: true }
				},
				_count: {
					select: { views: true }
				}
			}
		}),
		prisma.article.count({ where })
	])

	// Remap articles to include a direct 'views' count
	const articles = articlesData.map(({ _count, ...article }) => ({
		...article,
		views: _count.views
	}))

	return { articles, total }
}

export const getArticleById = async (id: string) => {
	const articleData = await prisma.article.findUnique({
		where: {
			id
		},
		include: {
			author: {
				select: { id: true, name: true, image: true }
			},
			category: {
				select: { id: true, name: true, slug: true }
			},
			tags: {
				select: { id: true, name: true, slug: true }
			},
			_count: {
				select: { views: true }
			}
		}
	})

	if (!articleData) return null

	const { _count, ...article } = articleData
	return {
		...article,
		views: _count.views
	}
}

export const getArticleBySlug = async (slug: string) => {
	const articleData = await prisma.article.findUnique({
		where: {
			slug
		},
		include: {
			author: {
				select: { id: true, name: true, image: true }
			},
			category: {
				select: { id: true, name: true, slug: true }
			},
			tags: {
				select: { id: true, name: true, slug: true }
			},
			_count: {
				select: { views: true }
			}
		}
	})

	if (!articleData) return null

	const { _count, ...article } = articleData
	return {
		...article,
		views: _count.views
	}
}

export const recordArticleView = async (
	articleId: string,
	viewerIp: string,
	userAgent?: string,
	referer?: string,
	userId?: string
) => {
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

	const existingView = await prisma.articleView.findFirst({
		where: {
			articleId: articleId,
			viewerIp: viewerIp,
			viewedAt: {
				gte: sevenDaysAgo
			}
		}
	})

	if (!existingView) {
		await prisma.articleView.create({
			data: {
				articleId: articleId,
				viewerIp: viewerIp,
				userAgent: userAgent || null,
				referer: referer || null,
				userId: userId || null,
				viewedAt: new Date()
			}
		})
	}
}

export const createArticle = async (
	data: CreateArticleModel,
	authorId: string
) => {
	const { status, categoryId, tagIds, ...rest } = data

	const articleCreateData: Prisma.ArticleCreateInput = {
		...rest,
		author: {
			connect: { id: authorId }
		}
	}

	if (categoryId) {
		const categoryExists = await prisma.category.findUnique({
			where: { id: categoryId }
		})
		if (!categoryExists) {
			throw new Error('Category not found')
		}
		articleCreateData.category = { connect: { id: categoryId } }
	}

	if (tagIds && tagIds.length > 0) {
		const existingTags = await prisma.tag.findMany({
			where: { id: { in: tagIds } }
		})
		if (existingTags.length !== tagIds.length) {
			throw new Error('One or more tags not found')
		}
		articleCreateData.tags = { connect: tagIds.map((id) => ({ id })) }
	}

	if (status !== undefined) {
		articleCreateData.status = status
	}

	return await prisma.article.create({
		data: articleCreateData
	})
}

export const updateArticle = async (id: string, data: UpdateArticleModel) => {
	const { status, categoryId, tagIds, ...rest } = data

	const articleUpdateData: Prisma.ArticleUpdateInput = { ...rest }

	if (status !== undefined) {
		articleUpdateData.status = status
	}

	if (categoryId !== undefined) {
		articleUpdateData.category = categoryId
			? { connect: { id: categoryId } }
			: { disconnect: true }
	}

	if (tagIds !== undefined) {
		articleUpdateData.tags = { set: tagIds.map((id) => ({ id })) }
	}

	return await prisma.article.update({
		where: {
			id
		},
		data: articleUpdateData
	})
}

export const deleteArticle = async (id: string) => {
	return await prisma.article.delete({
		where: {
			id
		}
	})
}
