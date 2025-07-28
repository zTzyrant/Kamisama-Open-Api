import { t } from 'elysia'

/**
 * Namespace untuk model-model yang digunakan bersama di seluruh aplikasi.
 */
export namespace SharedModel {
	/**
	 * Skema respon error standar untuk kegagalan validasi atau error server.
	 */
	export const ErrorResponse = t.Object({
		status: t.Literal('error'),
		message: t.String(),
		statusCode: t.String()
	})
}

/**
 * Namespace untuk semua model yang berhubungan dengan fitur Artikel.
 * Mengelompokkan skema untuk request body, query, dan berbagai format response.
 */
export namespace ArticleModel {
	// --- SKEMA DASAR YANG DAPAT DIGUNAKAN KEMBALI ---

	const Author = t.Object({
		id: t.String(),
		name: t.String(),
		image: t.Nullable(t.String())
	})

	const Category = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String()
	})

	const Tag = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String()
	})

	const Status = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String()
	})

	const Language = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String()
	})

	/**
	 * Skema data inti untuk satu artikel, termasuk relasinya.
	 * Ini adalah "source of truth" untuk objek artikel.
	 */
	export const data = t.Object({
		id: t.String(),
		title: t.String(),
		slug: t.String(),
		content: t.String(),
		excerpt: t.Nullable(t.String()),
		coverImage: t.Nullable(t.String()),
		createdAt: t.Date(),
		updatedAt: t.Date(),
		publishedAt: t.Nullable(t.Date()),
		views: t.Number(),
		author: Author,
		category: t.Nullable(Category),
		tags: t.Array(Tag),
		status: Status,
		lang: Language,
		permissions: t.Optional(
			t.Object({
				canEdit: t.Boolean(),
				canArchive: t.Boolean(),
				canDelete: t.Boolean()
			})
		)
	})

	// --- SKEMA UNTUK INPUT (DTO - Data Transfer Object) ---

	/**
	 * Skema validasi untuk membuat artikel baru (POST /articles).
	 */
	export const create = t.Object({
		title: t.String({
			minLength: 3,
			maxLength: 100,
			error: 'err_title_length'
		}),
		content: t.String({
			minLength: 3,
			error: 'err_content_min_length'
		}),
		statusId: t.String({ error: 'err_statusid_required' }),
		langId: t.String({ error: 'err_langid_required' }),
		slug: t.Optional(t.String({ minLength: 3, maxLength: 100 })),
		excerpt: t.Optional(t.Nullable(t.String({ minLength: 3, maxLength: 255 }))),
		coverImage: t.Optional(t.Nullable(t.String())),
		categoryId: t.Optional(t.String()),
		tagIds: t.Optional(t.Array(t.String()))
	})

	/**
	 * Skema validasi untuk memperbarui artikel (PUT /articles/:id).
	 * Semua properti bersifat opsional.
	 */
	export const update = t.Partial(create)

	/**
	 * Skema validasi untuk query parameter saat mengambil daftar artikel.
	 */
	export const query = t.Object({
		page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
		limit: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 100 })),
		search: t.Optional(t.String()),
		tags: t.Optional(t.String()),
		category: t.Optional(t.String()),
		statusId: t.Optional(t.String()),
		langId: t.Optional(t.String()),
		sortBy: t.Optional(
			t.Union([t.Literal('createdAt'), t.Literal('views')], {
				default: 'createdAt'
			})
		),
		orderBy: t.Optional(
			t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'desc' })
		)
	})

	// --- SKEMA UNTUK RESPONSE ---

	/**
	 * Skema response saat berhasil mengambil satu artikel.
	 */
	export const singleResponse = t.Object({
		status: t.Literal('success'),
		message: t.String(),
		data: data
	})

	/**
	 * Skema response saat berhasil mengambil daftar artikel, termasuk data paginasi.
	 */
	export const multipleResponse = t.Object({
		status: t.Literal('success'),
		message: t.String(),
		data: t.Array(data),
		pagination: t.Object({
			currentPage: t.Number(),
			totalPages: t.Number(),
			totalItems: t.Number(),
			perPage: t.Number(),
			nextPageUrl: t.Nullable(t.String()),
			prevPageUrl: t.Nullable(t.String())
		})
	})

	/**
	 * Skema response standar untuk operasi CUD (Create, Update, Delete) yang berhasil.
	 */
	export const mutationResponse = t.Object({
		status: t.Literal('success'),
		message: t.String(),
		data: t.Optional(data) // Data bisa jadi opsional, terutama untuk delete
	})

	// --- EKSPOR TIPE TypeScript ---
	export type Create = typeof create.static
	export type Update = typeof update.static
	export type Query = typeof query.static
	export type Data = typeof data.static
}
