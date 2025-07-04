import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { ipaymuVendor } from './modules/vendor/ipaymu'
import { authRoutes } from './modules/auth'
import { cors } from '@elysiajs/cors'
import { roleRoutes } from './modules/role'

const app = new Elysia()

app
	.use(
		cors({
			origin: 'http://localhost:5173',
			methods: ['GET', 'POST'],
			allowedHeaders: ['Content-Type', 'Authorization']
		})
	)
	.use(
		swagger({
			documentation: {
				tags: [
					{ name: 'App', description: 'General endpoints' },
					{ name: 'Authentication', description: 'Authentication endpoints' },
					{ name: 'Payment', description: 'Payment endpoints' }
				],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'JWT'
						}
					}
				},
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
	.group('/api/v1', (app) =>
		app.use(ipaymuVendor).use(authRoutes).use(roleRoutes)
	)
	.listen(process.env.PORT ?? 3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
