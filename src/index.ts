import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { ipaymuVendor } from './modules/vendor/ipaymu'
import { authRoutes } from './modules/auth'
import { cors } from '@elysiajs/cors'
import { roleRoutes } from './modules/role'
import { adminRoutes } from './modules/admin'
import { AuthService } from './modules/auth/service'

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
		app
			.use(ipaymuVendor)
			.use(authRoutes)
			.use(roleRoutes)
			.use(adminRoutes)
			.onBeforeHandle(async ({ jwt, bearer, set }) => {
				if (!bearer) {
					set.status = 401
					return { message: 'Unauthorized: No token provided' }
				}

				const decoded = await jwt.verify(bearer)

				if (!decoded || !decoded.jti) {
					set.status = 401
					return { message: 'Unauthorized: Invalid or malformed token' }
				}

				const isRevoked = await AuthService.isAccessTokenRevoked(decoded.jti)
				if (isRevoked) {
					set.status = 401
					return { message: 'Unauthorized: Token has been revoked' }
				}
			})
			.headers(
				t.Object({
					'x-device': t.String({
						default: 'unknown',
						description: 'Device type (e.g., web, mobile, desktop)'
					}),
					'x-device-id': t.Optional(
						t.String({ description: 'Unique device identifier' })
					),
					'x-lat': t.Optional(
						t.Numeric({ description: 'Latitude of the device' })
					),
					'x-long': t.Optional(
						t.Numeric({ description: 'Longitude of the device' })
					),
					'x-ip': t.Optional(
						t.String({ description: 'IP address of the device' })
					)
				})
			)
	)
	.listen(process.env.PORT ?? 3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
