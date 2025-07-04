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
		async ({ body, set, jwt, refreshTokenJwt, headers }) => {
			try {
				const device = headers['x-device'] || 'unknown'
				const deviceId = headers['x-device-id']
				const lat = headers['x-lat'] ? parseFloat(headers['x-lat']) : undefined
				const long = headers['x-long']
					? parseFloat(headers['x-long'])
					: undefined
				const ip = headers['x-ip']

				const tokens = await AuthService.login(body, jwt, refreshTokenJwt, {
					'x-device': device,
					'x-device-id': deviceId,
					'x-lat': lat,
					'x-long': long,
					'x-ip': ip
				})
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
				tags: ['Authentication'],
				headers: t.Object({
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
			}
		}
	)
	.post(
		'/refresh-token',
		async ({ body, set, jwt, bearer }) => {
			try {
				let oldAccessTokenJti: string | undefined
				let oldAccessTokenExp: number | undefined

				if (bearer) {
					const decodedAccessToken = await jwt.verify(bearer)
					if (decodedAccessToken && decodedAccessToken.jti && decodedAccessToken.exp) {
						oldAccessTokenJti = decodedAccessToken.jti
						oldAccessTokenExp = decodedAccessToken.exp
					}
				}

				const { accessToken, refreshToken } = await AuthService.refreshToken(
					decodedRefreshToken.jti,
					jwt,
					refreshTokenJwt,
					oldAccessTokenJti,
					oldAccessTokenExp
				)
				return { accessToken, refreshToken }
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
		async ({ body, set, jwt, bearer, refreshTokenJwt }) => {
			const decodedAccessToken = await jwt.verify(bearer)
			const decodedRefreshToken = await refreshTokenJwt.verify(body.refreshToken)

			if (!decodedRefreshToken || !decodedRefreshToken.jti) {
				set.status = 400
				return { message: 'Invalid refresh token' }
			}

			await AuthService.logout(
				decodedRefreshToken.jti, // Pass refresh token's jti
				decodedAccessToken?.jti, // Pass access token's jti (optional)
				decodedAccessToken?.exp // Pass access token's exp (optional)
			)
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
		'/revoke-session',
		async ({ body, jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeSession(user.id, body.sessionId)
			set.status = 204
		},
		{
			body: t.Object({
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke a Specific User Session',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-all-sessions',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeAllSessions(user.id)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Sessions',
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
	.post(
		'/revoke-session',
		async ({ body, jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeSession(user.id, body.sessionId)
			set.status = 204
		},
		{
			body: t.Object({
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke a Specific User Session',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-all-sessions',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeAllSessions(user.id)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Sessions',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-session',
		async ({ body, jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeSession(user.id, body.sessionId)
			set.status = 204
		},
		{
			body: t.Object({
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke a Specific User Session',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-all-sessions',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeAllSessions(user.id)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Sessions',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-session',
		async ({ body, jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeSession(user.id, body.sessionId)
			set.status = 204
		},
		{
			body: t.Object({
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke a Specific User Session',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-all-sessions',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeAllSessions(user.id)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Sessions',
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
	.post(
		'/revoke-session',
		async ({ body, jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeSession(user.id, body.sessionId)
			set.status = 204
		},
		{
			body: t.Object({
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke a Specific User Session',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-all-sessions',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeAllSessions(user.id)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Sessions',
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
	.post(
		'/revoke-session',
		async ({ body, jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeSession(user.id, body.sessionId)
			set.status = 204
		},
		{
			body: t.Object({
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke a Specific User Session',
				tags: ['Authentication']
			}
		}
	)
	.post(
		'/revoke-all-sessions',
		async ({ jwt, bearer, set }) => {
			const user = await jwt.verify(bearer)
			if (!user) {
				set.status = 401
				return { message: 'Unauthorized' }
			}
			await AuthService.revokeAllSessions(user.id)
			set.status = 204
		},
		{
			detail: {
				summary: 'Revoke All User Sessions',
				tags: ['Authentication']
			}
		}
	)
