// src/modules/auth/auth.model.ts
import { t } from 'elysia'

export const RegisterUserSchema = t.Object({
	name: t.String({
		minLength: 3,
		error() {
			return {
				code: 'INVALID_NAME_LENGTH',
				message: 'Nama harus memiliki setidaknya 3 karakter.'
			}
		}
	}),
	email: t.String({
		format: 'email',
		error() {
			return {
				code: 'INVALID_EMAIL_FORMAT',
				message: 'Format email tidak valid.'
			}
		}
	}),
	username: t.String({
		minLength: 4,
		error() {
			return {
				code: 'INVALID_USERNAME_LENGTH',
				message: 'Username harus memiliki setidaknya 4 karakter.'
			}
		}
	}),
	password: t.String({
		minLength: 8,
		error() {
			return {
				code: 'INVALID_PASSWORD_LENGTH',
				message: 'Password harus memiliki setidaknya 8 karakter.'
			}
		}
	})
})

export const LoginUserSchema = t.Object({
	username: t.String(),
	password: t.String()
})

export const RefreshTokenSchema = t.Object({
	refreshToken: t.String()
})

// Tipe data TypeScript untuk digunakan di service
export type RegisterUserDto = typeof RegisterUserSchema.static
export type LoginUserDto = typeof LoginUserSchema.static
