// src/modules/auth/auth.route.ts
import { Elysia } from 'elysia'
import { RegisterUserSchema } from './model'
import { AuthService } from './service'

export const authRoutes = new Elysia({ prefix: '/auth' }).post(
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
