import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { ipaymuVendor } from './modules/vendor/ipaymu'
import { cors } from '@elysiajs/cors'
import { auth, OpenAPI } from './libs/auth'
import { ArticleRoutes } from './modules/articles/index'
import { TagRoutes } from './modules/tags'
import { CategoryRoutes } from './modules/categories'
import { LanguageRoutes } from './modules/languages'
import { ArticleStatusRoutes } from './modules/article-statuses'
import { betterAuth } from './modules/auth/macros'
import { ProfileRoutes } from './modules/profile'

export const app = new Elysia()

app
	.use(
		cors({
			origin: ['http://localhost:3000', 'http://localhost:5173'],
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true
		})
	)
	.use(betterAuth)
	.get('/user', ({ user }) => user, {
		auth: true,
		detail: {
			tags: ['Authentication'],
			description: 'Get user data'
		}
	})
	.use(
		swagger({
			documentation: {
				tags: [
					{ name: 'App', description: 'General endpoints' },
					{ name: 'Authentication', description: 'Authentication endpoints' },
					{ name: 'Payment', description: 'Payment endpoints' },
					{ name: 'Languages', description: 'Endpoints for managing languages' },
					{ name: 'Article Statuses', description: 'Endpoints for managing article statuses' }
				],
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
				security: [
					{
						bearerAuth: []
					}
				]
			}
		})
	)
	.get(
		'/',
		({ status }) => {
			return status(200, {
				status: 200,
				message: 'Welcome to Kamisama Open API'
			})
		},
		{
			detail: {
				tags: ['App'],
				description: 'Welcome to Kamisama Open API',
				summary: 'Welcome to Kamisama Open API'
			}
		}
	)
	.group('/api/v1', (app) => app.use(ipaymuVendor))
	.use(ArticleRoutes)
	.use(TagRoutes)
	.use(CategoryRoutes)
	.use(ProfileRoutes)
	.use(LanguageRoutes)
	.use(ArticleStatusRoutes)
	.listen(process.env.PORT ?? 3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
