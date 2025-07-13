import { Elysia } from 'elysia'
import { auth } from '../../libs/auth'

export const betterAuth = new Elysia({ name: 'better-auth' })
	.mount('/', auth.handler)
	.macro({
		auth: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({
					headers
				})

				if (!session) return status(401)

				return {
					user: session.user,
					session: session.session
				}
			}
		},
		admin: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({
					headers
				})

				if (!session) return status(401)

				if (
					session.user.role !== 'admin' &&
					session.user.role !== 'superAdmin' &&
					session.user.role !== 'kamisama'
				)
					return status(403)
				return {
					user: session.user,
					session: session.session
				}
			}
		},
		superAdmin: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({
					headers
				})

				if (!session) return status(401)
				if (
					session.user.role !== 'superAdmin' &&
					session.user.role !== 'kamisama'
				)
					return status(403)

				return {
					user: session.user,
					session: session.session
				}
			}
		},
		kamisama: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({
					headers
				})

				if (!session) return status(401)
				if (session.user.role !== 'kamisama') return status(403)
				return {
					user: session.user,
					session: session.session
				}
			}
		}
	})
