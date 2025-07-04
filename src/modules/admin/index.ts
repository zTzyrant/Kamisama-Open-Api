// src/modules/admin/index.ts
import { Elysia, t } from 'elysia'
import { AdminService } from './service'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { AuthService } from '../auth/service' // For isAccessTokenRevoked

export const adminRoutes = new Elysia({ prefix: '/admin' })
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.JWT_ACCESS_SECRET!,
			schema: t.Object({
				id: t.String(),
				username: t.String(),
				jti: t.String(),
				role: t.String() // Ensure role is in JWT payload
			})
		})
	)
	.use(bearer())
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

		const userRole = await AuthService.getUserRoleById(decoded.id)

		if (userRole !== 'superadmin') {
			set.status = 403 // Forbidden
			return { message: 'Forbidden: Admin access required' }
		}

		const isRevoked = await AuthService.isAccessTokenRevoked(decoded.jti)
		if (isRevoked) {
			set.status = 401
			return { message: 'Unauthorized: Token has been revoked' }
		}
	})
	// --- User Management Routes ---
	.get(
		'/users',
		async ({ set }) => {
			const users = await AdminService.getAllUsers()
			return { data: users }
		},
		{
			detail: {
				summary: 'Get All Users',
				tags: ['Admin - Users'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.get(
		'/users/:id',
		async ({ params, set }) => {
			const user = await AdminService.getUserById(params.id)
			if (!user) {
				set.status = 404
				return { message: 'User not found' }
			}
			return { data: user }
		},
		{
			params: t.Object({
				id: t.String()
			}),
			detail: {
				summary: 'Get User by ID',
				tags: ['Admin - Users'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.post(
		'/users',
		async ({ body, set }) => {
			try {
				const newUser = await AdminService.createUser(body, body.roleName)
				set.status = 201
				return { message: 'User created successfully', data: newUser }
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			body: t.Object({
				name: t.String(),
				email: t.String(),
				username: t.String(),
				password: t.String(),
				roleName: t.String() // Expect roleName in body
			}),
			detail: {
				summary: 'Create New User',
				tags: ['Admin - Users'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.put(
		'/users/:id',
		async ({ params, body, set }) => {
			try {
				const updatedUser = await AdminService.updateUser(params.id, body)
				return { message: 'User updated successfully', data: updatedUser }
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			params: t.Object({
				id: t.String()
			}),
			body: t.Object({
				name: t.Optional(t.String()),
				email: t.Optional(t.String()),
				username: t.Optional(t.String()),
				roleName: t.Optional(t.String())
			}),
			detail: {
				summary: 'Update User',
				tags: ['Admin - Users'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.delete(
		'/users/:id',
		async ({ params, set }) => {
			try {
				await AdminService.deleteUser(params.id)
				set.status = 204
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			params: t.Object({
				id: t.String()
			}),
			detail: {
				summary: 'Delete User (Soft Delete)',
				tags: ['Admin - Users'],
				security: [{ bearerAuth: [] }]
			}
		}
	)

	// --- Session Management Routes ---
	.get(
		'/sessions',
		async ({ set }) => {
			const sessions = await AdminService.getAllSessions()
			return { data: sessions }
		},
		{
			detail: {
				summary: 'Get All Active Sessions',
				tags: ['Admin - Sessions'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.post(
		'/sessions/revoke',
		async ({ body, set }) => {
			try {
				await AdminService.revokeUserSession(body.userId, body.sessionId)
				set.status = 204
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			body: t.Object({
				userId: t.String(),
				sessionId: t.String()
			}),
			detail: {
				summary: 'Revoke Specific User Session',
				tags: ['Admin - Sessions'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.post(
		'/sessions/revoke-all',
		async ({ body, set }) => {
			try {
				await AdminService.revokeAllUserSessions(body.userId)
				set.status = 204
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			body: t.Object({
				userId: t.String()
			}),
			detail: {
				summary: 'Revoke All User Sessions',
				tags: ['Admin - Sessions'],
				security: [{ bearerAuth: [] }]
			}
		}
	)

	// --- Role Management Routes ---
	.get(
		'/roles',
		async ({ set }) => {
			const roles = await AdminService.getAllRoles()
			return { data: roles }
		},
		{
			detail: {
				summary: 'Get All Roles',
				tags: ['Admin - Roles'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.get(
		'/roles/:id',
		async ({ params, set }) => {
			const role = await AdminService.getRoleById(params.id)
			if (!role) {
				set.status = 404
				return { message: 'Role not found' }
			}
			return { data: role }
		},
		{
			params: t.Object({
				id: t.String()
			}),
			detail: {
				summary: 'Get Role by ID',
				tags: ['Admin - Roles'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.post(
		'/roles',
		async ({ body, set }) => {
			try {
				const newRole = await AdminService.createRole(
					body.name,
					body.description
				)
				set.status = 201
				return { message: 'Role created successfully', data: newRole }
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			body: t.Object({
				name: t.String(),
				description: t.Optional(t.String())
			}),
			detail: {
				summary: 'Create New Role',
				tags: ['Admin - Roles'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.put(
		'/roles/:id',
		async ({ params, body, set }) => {
			try {
				const updatedRole = await AdminService.updateRole(params.id, body)
				return { message: 'Role updated successfully', data: updatedRole }
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			params: t.Object({
				id: t.String()
			}),
			body: t.Object({
				name: t.Optional(t.String()),
				description: t.Optional(t.String())
			}),
			detail: {
				summary: 'Update Role',
				tags: ['Admin - Roles'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.delete(
		'/roles/:id',
		async ({ params, set }) => {
			try {
				await AdminService.deleteRole(params.id)
				set.status = 204
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			params: t.Object({
				id: t.String()
			}),
			detail: {
				summary: 'Delete Role',
				tags: ['Admin - Roles'],
				security: [{ bearerAuth: [] }]
			}
		}
	)
