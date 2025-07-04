import { Elysia, t } from 'elysia'
import { RoleService } from './service'
import { CreateRoleSchema, UpdateRoleSchema } from './model'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { AuthService } from '../auth/service'

export const roleRoutes = new Elysia({
	prefix: '/roles'
})
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.JWT_ACCESS_SECRET as string
		})
	)
	.use(bearer())
	.onBeforeHandle(async ({ set, jwt, bearer }) => {
		if (!bearer) {
			set.status = 401
			return { message: 'Unauthorized: Bearer token not provided.' }
		}

		const decoded = await jwt.verify(bearer)
		if (!decoded || typeof decoded === 'string' || !decoded.id) {
			set.status = 403
			return { message: 'Forbidden: Invalid token or missing user ID.' }
		}

		let userRole = decoded.role
		if (!userRole && decoded.id) {
			userRole = (await AuthService.getUserRoleById(
				decoded.id as string
			)) as string
		}

		if (userRole !== 'superadmin') {
			set.status = 403
			return { message: 'Forbidden: Only superadmin can access this resource.' }
		}
	})
	.post(
		'/',
		async ({ body, set }) => {
			try {
				const newRole = await RoleService.createRole(body)
				set.status = 201
				return { message: 'Role berhasil dibuat.', role: newRole }
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			body: CreateRoleSchema,
			detail: {
				tags: ['Role Management'],
				summary: 'Membuat role baru',
				description: 'Hanya superadmin yang dapat membuat role baru.'
			}
		}
	)
	.get(
		'/',
		async ({ set }) => {
			try {
				const roles = await RoleService.getAllRoles()
				return { message: 'Daftar role berhasil diambil.', roles }
			} catch (error: any) {
				set.status = 500
				return { message: error.message }
			}
		},
		{
			detail: {
				tags: ['Role Management'],
				summary: 'Mendapatkan semua role',
				description: 'Mendapatkan daftar semua role yang tersedia.'
			}
		}
	)
	.get(
		'/:id',
		async ({ params: { id }, set }) => {
			try {
				const role = await RoleService.getRoleById(id)
				return { message: 'Role berhasil diambil.', role }
			} catch (error: any) {
				set.status = 404
				return { message: error.message }
			}
		},
		{
			params: t.Object({
				id: t.String()
			}),
			detail: {
				tags: ['Role Management'],
				summary: 'Mendapatkan role berdasarkan ID',
				description: 'Mendapatkan detail role berdasarkan ID.'
			}
		}
	)
	.put(
		'/:id',
		async ({ params: { id }, body, set }) => {
			try {
				const updatedRole = await RoleService.updateRole(id, body)
				return { message: 'Role berhasil diperbarui.', role: updatedRole }
			} catch (error: any) {
				set.status = 400
				return { message: error.message }
			}
		},
		{
			params: t.Object({
				id: t.String()
			}),
			body: UpdateRoleSchema,
			detail: {
				tags: ['Role Management'],
				summary: 'Memperbarui role',
				description: 'Hanya superadmin yang dapat memperbarui role.'
			}
		}
	)
	.delete(
		'/:id',
		async ({ params: { id }, set }) => {
			try {
				await RoleService.deleteRole(id)
				set.status = 204
				return { message: 'Role berhasil dihapus.' }
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
				tags: ['Role Management'],
				summary: 'Menghapus role',
				description:
					'Hanya superadmin yang dapat menghapus role. Role tidak dapat dihapus jika masih ada pengguna yang terkait.'
			}
		}
	)
