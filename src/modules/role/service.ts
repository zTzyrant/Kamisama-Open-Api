import { prisma } from '../../lib/prisma'
import type { CreateRoleDto, UpdateRoleDto } from './model'

export class RoleService {
	static async createRole(roleData: CreateRoleDto) {
		const { name, description } = roleData
		const existingRole = await prisma.role.findUnique({ where: { name } })

		if (existingRole) {
			throw new Error('Role dengan nama tersebut sudah ada.')
		}

		return prisma.role.create({ data: { name, description } })
	}

	static async getAllRoles() {
		return prisma.role.findMany()
	}

	static async getRoleById(id: string) {
		const role = await prisma.role.findUnique({ where: { id } })
		if (!role) {
			throw new Error('Role tidak ditemukan.')
		}
		return role
	}

	static async updateRole(id: string, roleData: UpdateRoleDto) {
		const { name, description } = roleData

		if (name) {
			const existingRole = await prisma.role.findUnique({ where: { name } })
			if (existingRole && existingRole.id !== id) {
				throw new Error('Role dengan nama tersebut sudah ada.')
			}
		}

		return prisma.role.update({ where: { id }, data: { name, description } })
	}

	static async deleteRole(id: string) {
		// Periksa apakah ada user yang masih menggunakan role ini
		const usersWithRole = await prisma.user.count({ where: { roleId: id } })
		if (usersWithRole > 0) {
			throw new Error('Tidak dapat menghapus role karena masih ada pengguna yang terkait.')
		}

		return prisma.role.delete({ where: { id } })
	}
}
