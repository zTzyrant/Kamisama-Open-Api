import { BetterAuthError, User, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'
import { openAPI, username, admin, organization } from 'better-auth/plugins'
import { z } from 'zod'

import {
	ac,
	user,
	admin as adminAc,
	superAdmin,
	kamisama
} from '../modules/auth/permissions'

const prisma = new PrismaClient()

const CustomSignupBodySchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long' }),
	jobs: z
		.array(z.string())
		.min(1, { message: 'Jobs field is required and cannot be empty' })
})

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'mongodb'
	}),
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 1 week
		updateAge: 60 * 60 * 24 // 1 day
	},
	emailAndPassword: {
		enabled: true
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await prisma.profile.create({
						data: {
							userId: user.id,
							bio: null,
							avatar: null,
							jobs: [],
							socials: [],
							nationality: null,
							website: null,
							address: null,
							phone: null
						}
					})
				}
			}
		}
	},
	plugins: [
		openAPI(),
		username(),
		admin({
			ac,
			roles: {
				user,
				admin: adminAc,
				superAdmin,
				kamisama
			},
			defaultRole: 'user',
			adminRoles: ['admin', 'superAdmin', 'kamisama']
		}),
		organization()
	],
	basePath: '/api/auth',
	baseURL: 'http://localhost:3000',
	trustedOrigins: ['http://localhost:5173']
})

// ... sisa kode Anda tetap sama
let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
	getPaths: (prefix = '/api/auth') =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null)

			for (const path of Object.keys(paths)) {
				const key = prefix + path
				reference[key] = paths[path]

				for (const method of Object.keys(paths[path])) {
					const operation = (reference[key] as any)[method]
					if (key.includes('/api/auth/admin')) {
						operation.tags = ['Better Auth Admin']
					} else if (key.includes('/api/auth/organization')) {
						operation.tags = ['Better Auth Organization']
					} else {
						operation.tags = ['Better Auth']
					}
				}
			}

			return reference
		}) as Promise<any>,
	components: getSchema().then(({ components }) => components) as Promise<any>
} as const
