import { t } from 'elysia'

export const CreateRoleSchema = t.Object({
	name: t.String({
		minLength: 3,
		error() {
			return {
				code: 'INVALID_ROLE_NAME_LENGTH',
				message: 'Nama role harus memiliki setidaknya 3 karakter.'
			}
		}
	}),
	description: t.Optional(t.String())
})

export const UpdateRoleSchema = t.Object({
	name: t.Optional(t.String({
		minLength: 3,
		error() {
			return {
				code: 'INVALID_ROLE_NAME_LENGTH',
				message: 'Nama role harus memiliki setidaknya 3 karakter.'
			}
		}
	})),
	description: t.Optional(t.String())
})

export type CreateRoleDto = typeof CreateRoleSchema.static
export type UpdateRoleDto = typeof UpdateRoleSchema.static
