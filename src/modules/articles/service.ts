import { PrismaClient, Prisma } from '@prisma/client'
import type { CreateArticleModel, UpdateArticleModel } from './model'
import { generateSlug } from '../../utils/slug'

const prisma = new PrismaClient()

interface GetArticlesOptions {
	page?: number
	limit?: number
	search?: string
	tags?: string // comma-separated tag IDs
	category?: string // category ID
	statusId?: string // Add status filter
	langId?: string // Add language filter
	sortBy?: 'createdAt' | 'views'
	orderBy?: 'asc' | 'desc'
	authorId?: string
}

const getDefaultArticleStatusId = async () => {
	const defaultStatus = await prisma.articleStatus.findUnique({
		where: { slug: 'draft' },
		select: { id: true }
	})
	if (!defaultStatus) {
		throw new Error('Default article status (draft) not found.')
	}
	return defaultStatus.id
}

const getDefaultLanguageId = async () => {
	const defaultLang = await prisma.language.findUnique({
		where: { slug: 'id' },
		select: { id: true }
	})
	if (!defaultLang) {
		throw new Error('Default language (id) not found.')
	}
	return defaultLang.id
}

// A single function to get articles with all the filters and options
export const findArticles = async (options: GetArticlesOptions) => {
	const {
		page = 1,
		limit = 10,
		search,
		tags,
		category,
		statusId,
		langId,
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

	if (statusId) {
		where.statusId = statusId
	}

	if (langId) {
		where.langId = langId
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
				status: {
					select: { id: true, name: true, slug: true }
				},
				lang: {
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
			status: {
				select: { id: true, name: true, slug: true }
			},
			lang: {
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
			status: {
				select: { id: true, name: true, slug: true }
			},
			lang: {
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
	const finalStatusId = data.statusId || (await getDefaultArticleStatusId());
	const finalLangId = data.langId || (await getDefaultLanguageId());

	let articleSlug = data.slug;
	if (!articleSlug) {
		const date = new Date();
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const baseSlug = generateSlug(data.title);
		let uniqueSlug = `${baseSlug}-${year}-${month}-${day}`;
		let counter = 0;
		while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
			counter++;
			uniqueSlug = `${baseSlug}-${year}-${month}-${day}-${counter}`;
		}
		articleSlug = uniqueSlug;
	}

	const articleCreateData: Prisma.ArticleCreateInput = {
		title: data.title,
		slug: articleSlug,
		content: data.content,
		author: { connect: { id: authorId } },
		status: { connect: { id: finalStatusId } },
		lang: { connect: { id: finalLangId } },
	};

	if (data.excerpt !== null) {
		articleCreateData.excerpt = data.excerpt;
	}

	if (data.coverImage !== null) {
		articleCreateData.coverImage = data.coverImage;
	}

	if (data.categoryId) {
		articleCreateData.category = { connect: { id: data.categoryId } };
	}

	if (data.tagIds && data.tagIds.length > 0) {
		articleCreateData.tags = { connect: data.tagIds.map(id => ({ id })) };
	}

	return await prisma.article.create({
		data: articleCreateData
	});
}

export const updateArticle = async (id: string, data: UpdateArticleModel) => {
	const { statusId, langId, categoryId, tagIds, excerpt, coverImage, slug, ...rest } = data

	const existingArticle = await prisma.article.findUnique({ where: { id } })
	if (!existingArticle) {
		return null // Or throw an error, depending on desired behavior
	}

	const articleUpdateData: Prisma.ArticleUpdateInput = { ...rest }

	if (slug !== undefined && slug !== existingArticle.slug) {
		let newSlug = generateSlug(slug)
		let counter = 0
		while (await prisma.article.findUnique({ where: { slug: newSlug } })) {
			counter++
			newSlug = `${generateSlug(slug)}-${counter}`
		}
		articleUpdateData.slug = newSlug
	} else if (slug === null) {
		// If slug is explicitly set to null, it means user wants to clear it.
		// However, slug is a required field in Prisma, so we should prevent this or handle it.
		// For now, let's throw an error or ignore the update for slug.
		throw new Error('Slug cannot be set to null.')
	}

	if (excerpt !== undefined) {
		articleUpdateData.excerpt = excerpt
	}
	if (coverImage !== undefined) {
		articleUpdateData.coverImage = coverImage
	}

	if (statusId !== undefined) {
		articleUpdateData.status = { connect: { id: statusId } }
	}

	if (langId !== undefined) {
		articleUpdateData.lang = { connect: { id: langId } }
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

