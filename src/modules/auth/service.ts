// src/modules/auth/auth.service.ts
import { prisma } from '../../lib/prisma'
import type { RegisterUserDto } from './model'

export class AuthService {
	/**
	 * Mendaftarkan user baru ke dalam database.
	 * @param userData Data user dari request body yang sudah divalidasi.
	 */
	static async register(userData: RegisterUserDto) {
		const { name, email, username, password } = userData

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email: email }, { username: username }]
			}
		})

		if (existingUser) {
			throw new Error('Email atau username sudah terdaftar.')
		}

		const hashedPassword = await Bun.password.hash(password, {
			algorithm: 'bcrypt',
			cost: 10
		})

		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				username,
				password: hashedPassword // Simpan password yang sudah di-hash
			}
		})

		const userWithoutPassword = { ...newUser }
		delete (userWithoutPassword as any).password

		return userWithoutPassword
	}
}
