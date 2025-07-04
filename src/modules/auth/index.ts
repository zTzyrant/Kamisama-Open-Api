// src/modules/auth/auth.route.ts
import { Elysia, t } from 'elysia'
import {
	LoginUserSchema,
	RefreshTokenSchema,
	RegisterUserSchema
} from './model'
import { AuthService } from './service'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { prisma } from '../../lib/prisma'

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
	throw new Error('JWT secrets are not defined in the environment variables.')
}

export const authRoutes = new Elysia({ prefix: '/auth' })
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.JWT_ACCESS_SECRET,
			exp: '15m',
			schema: t.Object({
				id: t.String(),
				username: t.String(),
				jti: t.String() // Add jti to access token payload
			})
		})
	)
	.use(
		jwt({
			name: 'refreshTokenJwt',
			secret: process.env.JWT_REFRESH_SECRET,
			exp: '7d',
			schema: t.Object({
				id: t.String(),
				username: t.String()
			})
		})
	)
	.use(bearer())
	.onBeforeHandle(async ({ jwt, bearer, set }) => {
		if (bearer) {
			const decoded = await jwt.verify(bearer)
			if (decoded && decoded.jti) {
				const revoked = await prisma.revokedAccessToken.findUnique({
					where: { jti: decoded.jti }
				})
				if (revoked) {
					set.status = 401
					return { message: 'Token has been revoked' }
				}
			}
		}
	})
	.post(
		'/register',
		async ({ body, set }) => {
			try {
				const newUser = await AuthService.register(body)

				set.status = 201 // 201 Created
				return {
					status: 201,
					message: 'User berhasil dibuat.',
					data: newUser
				}
			} catch (error: any) {
				// Cek apakah error karena duplikat
				if (error.message.includes('sudah terdaftar')) {
					set.status = 409 // 409 Conflict
					return {
						status: 409,
						message: error.message
					}
				}

				// Untuk error lainnya
				console.error('[AuthRegister Error]', error)
				set.status = 500 // 500 Internal Server Error
				return {
					status: 500,
					message: 'Terjadi kesalahan pada server.'
				}
			}
		},
		{
			body: RegisterUserSchema,
			detail: {
				summary: 'Register a New User',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/login',
		async ({ body, set, jwt, refreshTokenJwt }) => {
			try {
				const tokens = await AuthService.login(body, jwt, refreshTokenJwt)
				return { ...tokens }
			} catch (error: any) {
				set.status = 401
				return { message: error.message }
			}
		},
		{
			body: LoginUserSchema,
			detail: {
				summary: 'Login a User',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/refresh-token',
		async ({ body, set, jwt }) => {
			try {
				const { accessToken } = await AuthService.refreshToken(
					body.refreshToken,
					jwt
				)
				return { accessToken }
			} catch (error: any) {
				set.status = 401
				return { message: error.message }
			}
		},
		{
			body: RefreshTokenSchema,
			detail: {
				summary: 'Refresh Access Token',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/logout',
		async ({ body, set, jwt, bearer }) => {
			const decodedAccessToken = await jwt.verify(bearer)
			if (decodedAccessToken && decodedAccessToken.jti) {
				await AuthService.logout(body.refreshToken, decodedAccessToken.jti, decodedAccessToken.exp)
			} else {
				await AuthService.logout(body.refreshToken, undefined, undefined)
			}
			set.status = 204
		},
		{
			body: RefreshTokenSchema,
			detail: {
				summary: 'Logout a User',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-token',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeToken(user.id, user.jti, user.exp)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Tokens',
				tags: ['Authentication']
			}
		}
	)
	.get(
		'/sessions/me',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			const sessions = await AuthService.getActiveSessions(user.id)
			return { sessions }
		},
		{
			detail: {
				summary: 'Get My Active Sessions',
				tags: ['Authentication']
			}
		}
	)
	.get(
		'/users/active',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			// NOTE: Add admin role check here in a real application
			const users = await AuthService.getAllActiveUsers()
			return { users }
		},
		{
			detail: {
				summary: 'Get All Active Users (Admin Only)',
				tags: ['Authentication']
			}
		}
	)
	.get(
		'/sessions/active',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			// NOTE: Add admin role check here in a real application
			const sessions = await AuthService.getAllActiveSessions()
			return { sessions }
		},
		{
			detail: {
				summary: 'Get All Active Sessions (Admin Only)',
				tags: ['Authentication']
			}
		}
	)
