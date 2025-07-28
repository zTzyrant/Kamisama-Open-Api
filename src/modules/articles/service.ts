import { PrismaClient, Prisma } from '@prisma/client'
import { ArticleModel } from './model' // Mengimpor namespace utama dari model
import { generateSlug } from '../../utils/slug'
import { sanitizeEditorJsContent } from '../../utils/xss'
import { getFullUrl } from '../../utils/url'

const prisma = new PrismaClient()

/**
 * Service untuk menangani semua logika bisnis yang terkait dengan artikel.
 * Dibuat sebagai 'abstract class' dengan metode 'static' karena tidak perlu menyimpan state internal.
 * Ini mencegah instansiasi kelas yang tidak perlu dan mengikuti best practice.
 */
export abstract class ArticleService {
	// --- METODE HELPER INTERNAL (PRIVATE) ---

	/**
	 * Mengubah path relatif gambar menjadi URL lengkap.
	 * @private
	 */
	private static transformArticle(article: any): ArticleModel.Data | null {
		if (!article) {
			return null
		}

		// Transformasi coverImage
		if (article.coverImage) {
			article.coverImage = getFullUrl(article.coverImage)
		}

		// Transformasi gambar di dalam konten Editor.js
		if (article.content && typeof article.content === 'string') {
			try {
				const content = JSON.parse(article.content)
				if (content.blocks && Array.isArray(content.blocks)) {
					content.blocks.forEach((block: any) => {
						if (block.type === 'image' && block.data?.file?.url) {
							block.data.file.url = getFullUrl(block.data.file.url)
						}
					})
				}
				article.content = JSON.stringify(content)
			} catch (error) {
				// Biarkan jika konten bukan JSON valid
			}
		}

		// Transformasi gambar author
		if (article.author?.image) {
			article.author.image = getFullUrl(article.author.image)
		}

		// Memastikan tipe data output sesuai dengan ArticleModel.Data
		const { _count, ...rest } = article
		return {
			...rest,
			views: _count?.views ?? article.views ?? 0,
			category: article.category || null,
			publishedAt: article.publishedAt || null
		} as ArticleModel.Data
	}

	private static async getPublishStatusId(): Promise<string> {
		const status = await prisma.articleStatus.findUnique({
			where: { slug: 'published' },
			select: { id: true }
		})
		if (!status) throw new Error('Article status "published" not found.')
		return status.id
	}

	private static async getDefaultArticleStatusId(): Promise<string> {
		const status = await prisma.articleStatus.findUnique({
			where: { slug: 'draft' },
			select: { id: true }
		})
		if (!status) throw new Error('Default article status "draft" not found.')
		return status.id
	}

	private static async getDefaultLanguageId(): Promise<string> {
		const lang = await prisma.language.findUnique({
			where: { slug: 'id' },
			select: { id: true }
		})
		if (!lang) throw new Error('Default language "id" not found.')
		return lang.id
	}

	// --- METODE PUBLIK SERVICE ---

	/**
	 * Menemukan artikel dengan filter, paginasi, dan pengurutan.
	 */
	static async findArticles(
		options: ArticleModel.Query & { authorId?: string; statusId?: string }
	) {
		const {
			page = 1,
			limit = 10,
			search,
			tags,
			category,
			langId,
			statusId,
			sortBy,
			orderBy,
			authorId
		} = options
		const skip = (page - 1) * limit

		const where: Prisma.ArticleWhereInput = {
			statusId: statusId || (await this.getPublishStatusId())
		}

		if (authorId) where.authorId = authorId
		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ content: { contains: search, mode: 'insensitive' } },
				{ excerpt: { contains: search, mode: 'insensitive' } }
			]
		}
		if (category) where.categoryId = category
		if (tags) {
			where.tags = {
				some: {
					id: {
						in: tags
							.split(',')
							.map((t) => t.trim())
							.filter(Boolean)
					}
				}
			}
		}
		if (langId) where.langId = langId

		const orderByClause: Prisma.ArticleOrderByWithRelationInput =
			sortBy === 'views'
				? { views: { _count: orderBy } }
				: { createdAt: orderBy }

		const [articlesData, total] = await prisma.$transaction([
			prisma.article.findMany({
				where,
				skip,
				take: limit,
				orderBy: orderByClause,
				include: {
					author: { select: { id: true, name: true, image: true } },
					category: true,
					tags: true,
					status: true,
					lang: true,
					_count: { select: { views: true } }
				}
			}),
			prisma.article.count({ where })
		])

		const articles = articlesData.map(
			(article) => this.transformArticle(article) as ArticleModel.Data
		)

		return { articles, total }
	}

	/**
	 * Mendapatkan artikel berdasarkan ID. Melempar Error jika tidak ditemukan.
	 */
	static async getArticleById(id: string): Promise<ArticleModel.Data> {
		const articleData = await prisma.article.findUnique({
			where: { id },
			include: {
				author: { select: { id: true, name: true, image: true } },
				category: true,
				tags: true,
				status: true,
				lang: true,
				_count: { select: { views: true } }
			}
		})

		if (!articleData) {
			throw new Error('Article not found')
		}

		return this.transformArticle(articleData) as ArticleModel.Data
	}

	/**
	 * Mendapatkan artikel berdasarkan slug. Melempar Error jika tidak ditemukan.
	 */
	static async getArticleBySlug(slug: string): Promise<ArticleModel.Data> {
		const articleData = await prisma.article.findUnique({
			where: { slug },
			include: {
				author: { select: { id: true, name: true, image: true } },
				category: true,
				tags: true,
				status: true,
				lang: true,
				_count: { select: { views: true } }
			}
		})

		if (!articleData) {
			throw new Error('Article not found')
		}

		return this.transformArticle(articleData) as ArticleModel.Data
	}

	/**
	 * Merekam jejak view artikel.
	 */
	static async recordArticleView(
		articleId: string,
		viewerIp: string,
		userAgent?: string,
		referer?: string,
		userId?: string
	): Promise<void> {
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		const existingView = await prisma.articleView.findFirst({
			where: { articleId, viewerIp, viewedAt: { gte: sevenDaysAgo } }
		})

		if (!existingView) {
			await prisma.articleView.create({
				data: {
					articleId,
					viewerIp,
					userAgent: userAgent || null,
					referer: referer || null,
					userId: userId || null
				}
			})
		}
	}

	/**
	 * Membuat artikel baru.
	 */
	static async createArticle(
		data: ArticleModel.Create,
		authorId: string
	): Promise<ArticleModel.Data> {
		const finalStatusId =
			data.statusId || (await this.getDefaultArticleStatusId())
		const finalLangId = data.langId || (await this.getDefaultLanguageId())

		let articleSlug = data.slug
		if (!articleSlug) {
			const date = new Date()
			const baseSlug = generateSlug(data.title)
			let uniqueSlug = `${baseSlug}-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
			let counter = 0
			while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
				counter++
				uniqueSlug = `${baseSlug}-${counter}`
			}
			articleSlug = uniqueSlug
		}

		const articleCreateData: Prisma.ArticleCreateInput = {
			title: data.title,
			slug: articleSlug,
			content: sanitizeEditorJsContent(data.content),
			author: { connect: { id: authorId } },
			status: { connect: { id: finalStatusId } },
			lang: { connect: { id: finalLangId } },
			...(data.excerpt && { excerpt: data.excerpt }),
			...(data.coverImage && { coverImage: data.coverImage }),
			...(data.categoryId && {
				category: { connect: { id: data.categoryId } }
			}),
			...(data.tagIds &&
				data.tagIds.length > 0 && {
					tags: { connect: data.tagIds.map((id) => ({ id })) }
				})
		}

		const newArticle = await prisma.article.create({
			data: articleCreateData,
			include: {
				author: { select: { id: true, name: true, image: true } },
				category: true,
				tags: true,
				status: true,
				lang: true,
				_count: { select: { views: true } }
			}
		})

		return this.transformArticle(newArticle) as ArticleModel.Data
	}

	/**
	 * Memperbarui artikel. Melempar Error jika tidak ditemukan.
	 */
	static async updateArticle(
		id: string,
		data: ArticleModel.Update
	): Promise<ArticleModel.Data> {
		const {
			statusId,
			langId,
			categoryId,
			tagIds,
			excerpt,
			coverImage,
			slug,
			content,
			...rest
		} = data

		const existingArticle = await prisma.article.findUnique({ where: { id } })
		if (!existingArticle) {
			throw new Error('Article not found')
		}

		const articleUpdateData: Prisma.ArticleUpdateInput = { ...rest }

		if (content !== undefined)
			articleUpdateData.content = sanitizeEditorJsContent(content)
		if (excerpt !== undefined) articleUpdateData.excerpt = excerpt
		if (coverImage !== undefined) articleUpdateData.coverImage = coverImage
		if (statusId !== undefined)
			articleUpdateData.status = { connect: { id: statusId } }
		if (langId !== undefined)
			articleUpdateData.lang = { connect: { id: langId } }
		if (categoryId !== undefined)
			articleUpdateData.category = categoryId
				? { connect: { id: categoryId } }
				: { disconnect: true }
		if (tagIds !== undefined)
			articleUpdateData.tags = { set: tagIds.map((id) => ({ id })) }

		const updatedArticle = await prisma.article.update({
			where: { id },
			data: articleUpdateData,
			include: {
				author: { select: { id: true, name: true, image: true } },
				category: true,
				tags: true,
				status: true,
				lang: true,
				_count: { select: { views: true } }
			}
		})

		return this.transformArticle(updatedArticle) as ArticleModel.Data
	}

	/**
	 * Menghapus artikel. Melempar Error jika tidak ditemukan.
	 */
	static async deleteArticle(id: string): Promise<void> {
		try {
			await prisma.article.delete({ where: { id } })
		} catch (error: any) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				// P2025 adalah kode error Prisma untuk "Record to delete does not exist."
				throw new Error('Article not found')
			}
			throw error // Lemparkan kembali error lain yang tidak terduga
		}
	}
}
