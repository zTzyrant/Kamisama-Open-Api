import { PrismaClient, Prisma } from '@prisma/client'
import type { CreateArticleModel, UpdateArticleModel } from './model'

const prisma = new PrismaClient()

interface GetArticlesOptions {
	page?: number
	limit?: number
	search?: string
	tags?: string // comma-separated tag IDs
	category?: string // category ID
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

export const createArticle = async (
	data: CreateArticleModel,
	authorId: string
) => {
	return await prisma.article.create({
		data: {
			...data,
			authorId
		}
	})
}

export const updateArticle = async (id: string, data: UpdateArticleModel) => {
	return await prisma.article.update({
		where: {
			id
		},
		data
	})
}

export const deleteArticle = async (id: string) => {
	return await prisma.article.delete({
		where: {
			id
		}
	})
}
