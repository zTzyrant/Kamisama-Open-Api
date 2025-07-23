import { t } from 'elysia'

/**
 * Represents the currently authenticated user.
 */
export const CurrentUserSchema = t.Object({
	id: t.String(),
	role: t.Union([
		t.Literal('user'),
		t.Literal('admin'),
		t.Literal('superAdmin'),
		t.Literal('kamisama')
	])
})

/**
 * Represents a subset of the article data relevant for permissions.
 */
export const ArticleAuthorSchema = t.Object({
	authorId: t.String()
})

// Define plain TypeScript types from the schemas for use in the function signature.
type CurrentUser = typeof CurrentUserSchema.static
type Article = typeof ArticleAuthorSchema.static

/**
 * Determines the permissions a user has for a given article.
 *
 * @param currentUser - The user object, must conform to the CurrentUser type.
 * @param article - The article object, must conform to the Article type.
 * @returns An object with boolean flags for canEdit, canArchive, and canDelete.
 */
export function getArticlePermissions(
	currentUser: CurrentUser,
	article: Article
) {
	const isAuthor = currentUser.id === article.authorId
	const isAdmin = ['admin', 'superAdmin', 'kamisama'].includes(currentUser.role)
	const isSuperAdminOrHigher = ['superAdmin', 'kamisama'].includes(
		currentUser.role
	)

	return {
		canEdit: isAuthor,
		canArchive: isAuthor || isSuperAdminOrHigher,
		canDelete: isAuthor || isSuperAdminOrHigher
	}
}
