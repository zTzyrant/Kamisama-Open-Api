// src/modules/auth/auth.service.ts
import { prisma } from '../../lib/prisma'
import type { LoginUserDto, RegisterUserDto } from './model'
import { v4 as uuidv4 } from 'uuid'

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
				password: hashedPassword, // Simpan password yang sudah di-hash
				role: { connect: { name: 'user' } } // Assign default role, adjust as needed
			}
		})

		const userWithoutPassword = { ...newUser }
		delete (userWithoutPassword as any).password

		return userWithoutPassword
	}

	static async login(userData: LoginUserDto, jwt: any, refreshTokenJwt: any) {
		const { username, password } = userData

		const user = await prisma.user.findUnique({
			where: { username }
		})

		if (!user) {
			throw new Error('User tidak ditemukan.')
		}

		const isPasswordValid = await Bun.password.verify(password, user.password)

		if (!isPasswordValid) {
			throw new Error('Password salah.')
		}

		const jti = uuidv4() // Generate a unique ID for the access token

		const accessToken = await jwt.sign({
			id: user.id,
			username: user.username,
			jti // Include jti in the access token payload
		})

		const refreshToken = await refreshTokenJwt.sign({
			id: user.id,
			username: user.username
		})

		const existingToken = await prisma.token.findFirst({
			where: {
				userId: user.id
			}
		})

		if (existingToken) {
			await prisma.token.update({
				where: {
					id: existingToken.id
				},
				data: {
					token: refreshToken,
					expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
				}
			})
		} else {
			await prisma.token.create({
				data: {
					token: refreshToken,
					userId: user.id,
					expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
				}
			})
		}

		return { accessToken, refreshToken }
	}

	static async logout(refreshToken: string, jti?: string, exp?: number) {
		const existingToken = await prisma.token.findUnique({
			where: { token: refreshToken }
		})

		if (existingToken) {
			await prisma.token.update({
				where: { id: existingToken.id },
				data: { isRevoked: true }
			})
		}

		if (jti && exp) {
			// Add the access token's jti to the revoked list
			await prisma.revokedAccessToken.create({
				data: {
					jti,
					expiresAt: new Date(exp * 1000) // exp is in seconds, convert to milliseconds
				}
			})
		}
	}

	static async refreshToken(refreshToken: string, jwtSigner: any) {
		const existingToken = await prisma.token.findUnique({
			where: { token: refreshToken, isRevoked: false }
		})

		if (!existingToken || new Date() > existingToken.expiresAt) {
			throw new Error('Refresh token tidak valid atau telah kedaluwarsa.')
		}

		const user = await prisma.user.findUnique({
			where: { id: existingToken.userId },
			include: {
				role: true
			}
		})

		if (!user) {
			throw new Error('User tidak ditemukan.')
		}

		const jti = uuidv4() // Generate a new unique ID for the new access token

		const accessToken = await jwtSigner.sign({
			id: user.id,
			username: user.username,
			role: user.role.name, // Sertakan nama role dalam payload JWT
			jti // Include new jti in the access token payload
		})

		return { accessToken }
	}

	static async revokeToken(userId: string, jti?: string, exp?: number) {
		await prisma.token.updateMany({
			where: { userId: userId, isRevoked: false },
			data: { isRevoked: true }
		})

		if (jti && exp) {
			// Add the access token's jti to the revoked list
			await prisma.revokedAccessToken.create({
				data: {
					jti,
					expiresAt: new Date(exp * 1000) // exp is in seconds, convert to milliseconds
				}
			})
		}
	}

	static async getActiveSessions(userId: string) {
		return prisma.token.findMany({
			where: {
				userId: userId,
				isRevoked: false,
				expiresAt: {
					gt: new Date()
				}
			},
			select: {
				id: true,
				createdAt: true,
				expiresAt: true
			}
		})
	}

	static async getAllActiveUsers() {
		return prisma.user.findMany({
			where: {
				tokens: {
					some: {
						isRevoked: false,
						expiresAt: {
							gt: new Date()
						}
					}
				}
			},
			select: {
				id: true,
				name: true,
				username: true,
				email: true
			}
		})
	}

	static async getAllActiveSessions() {
		return prisma.token.findMany({
			where: {
				isRevoked: false,
				expiresAt: {
					gt: new Date()
				}
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						username: true
					}
				}
			}
		})
	}

	static async getUserRoleById(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				role: true
			}
		})
		return user?.role.name
	}
}
