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

	static async login(
		userData: LoginUserDto,
		jwt: any,
		refreshTokenJwt: any,
		headers: {
			'x-device': string
			'x-device-id'?: string
			'x-lat'?: number
			'x-long'?: number
			'x-ip'?: string
		}
	) {
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

		const accessTokenJti = uuidv4() // Generate a unique ID for the access token
		const refreshTokenJti = uuidv4() // Generate a unique ID for the refresh token

		const accessToken = await jwt.sign({
			id: user.id,
			username: user.username,
			jti: accessTokenJti // Include jti in the access token payload
		})

		const refreshToken = await refreshTokenJwt.sign({
			id: user.id,
			username: user.username,
			jti: refreshTokenJti // Include jti in the refresh token payload
		})

		const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

		// Always create a new Token entry for each login session
		const newToken = await prisma.token.create({
			data: {
				token: refreshToken,
				jti: refreshTokenJti, // Store the refresh token's jti
				userId: user.id,
				expiresAt: sessionExpiresAt
			}
		})

		await prisma.userSession.create({
			data: {
				userId: user.id,
				tokenId: newToken.id,
				device: headers['x-device'],
				deviceId: headers['x-device-id'],				ip: headers['x-ip'],
				lat: headers['x-lat'],
				long: headers['x-long'],
				expiresAt: sessionExpiresAt
			}
		})

		return { accessToken, refreshToken }
	}

		static async logout(refreshTokenJti: string, accessTokenJti?: string, accessTokenExp?: number) {
		const existingToken = await prisma.token.findUnique({
			where: { jti: refreshTokenJti },
			include: { session: true } // Include session to invalidate it
		})

		if (existingToken) {
			await prisma.token.update({
				where: { id: existingToken.id },
				data: { isRevoked: true }
			})
			// Invalidate the corresponding user session
			if (existingToken.session) {
				await prisma.userSession.delete({
					where: { id: existingToken.session.id }
				})
			}
		}

		if (accessTokenJti && accessTokenExp) {
			// Add the access token's jti to the revoked list
			await prisma.revokedAccessToken.create({
				data: {
					jti: accessTokenJti,
					expiresAt: new Date(accessTokenExp * 1000) // exp is in seconds, convert to milliseconds
				}
			})
		}
	}

	static async refreshToken(oldRefreshTokenJti: string, jwtSigner: any, refreshTokenJwtSigner: any, oldAccessTokenJti?: string, oldAccessTokenExp?: number) {
		const existingToken = await prisma.token.findUnique({
			where: { jti: oldRefreshTokenJti, isRevoked: false }
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

		// Revoke the old refresh token
		await prisma.token.update({
			where: { id: existingToken.id },
			data: { isRevoked: true }
		})

		// Revoke the old access token's jti if provided
		if (oldAccessTokenJti && oldAccessTokenExp) {
			await prisma.revokedAccessToken.create({
				data: {
					jti: oldAccessTokenJti,
					expiresAt: new Date(oldAccessTokenExp * 1000)
				}
			})
		}

		const newAccessTokenJti = uuidv4() // Generate a new unique ID for the new access token
		const newRefreshTokenJti = uuidv4() // Generate a new unique ID for the new refresh token

		const newAccessToken = await jwtSigner.sign({
			id: user.id,
			username: user.username,
			jti: newAccessTokenJti // Include new jti in the access token payload
		})

		const newRefreshToken = await refreshTokenJwtSigner.sign({
			id: user.id,
			username: user.username,
			jti: newRefreshTokenJti // Include new jti in the refresh token payload
		})

		const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

		// Create a new Token entry for the new refresh token
		await prisma.token.create({
			data: {
				token: newRefreshToken,
				jti: newRefreshTokenJti,
				userId: user.id,
				expiresAt: sessionExpiresAt
			}
		})

		return { accessToken: newAccessToken, refreshToken: newRefreshToken }
	}

	static async isAccessTokenRevoked(jti: string): Promise<boolean> {
		const revokedToken = await prisma.revokedAccessToken.findUnique({
			where: { jti },
		})
		return !!revokedToken && revokedToken.expiresAt > new Date()
	}

	static async revokeToken(userId: string, jti?: string, exp?: number) {
		await prisma.token.updateMany({
			where: { userId: userId, isRevoked: false },
			data: { isRevoked: true }
		})
		// Invalidate all user sessions for this user
		await prisma.userSession.deleteMany({
			where: { userId: userId }
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
		return prisma.userSession.findMany({
			where: {
				userId: userId,
				expiresAt: {
					gt: new Date()
				}
			},
			select: {
				id: true,
				device: true,
				deviceId: true,
				ip: true,
				lat: true,
				long: true,
				createdAt: true,
				expiresAt: true
			}
		})
	}

	static async revokeSession(userId: string, sessionId: string) {
		const sessionToRevoke = await prisma.userSession.findUnique({
			where: { id: sessionId, userId: userId }
		})

		if (sessionToRevoke) {
			// Revoke the associated token
			await prisma.token.update({
				where: { id: sessionToRevoke.tokenId },
				data: { isRevoked: true }
			})
			// Delete the session
			await prisma.userSession.delete({
				where: { id: sessionId }
			})
		}
	}

	static async revokeAllSessions(userId: string) {
		// Revoke all tokens for the user
		await prisma.token.updateMany({
			where: { userId: userId, isRevoked: false },
			data: { isRevoked: true }
		})
		// Delete all sessions for the user
		await prisma.userSession.deleteMany({
			where: { userId: userId }
		})
	}

	static async getAllActiveUsers() {
		return prisma.user.findMany({
			where: {
				sessions: {
					some: {
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
		return prisma.userSession.findMany({
			where: {
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
