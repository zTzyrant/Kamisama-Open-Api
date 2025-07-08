import { BetterAuthError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'
import { openAPI, username, admin, organization } from 'better-auth/plugins'

const prisma = new PrismaClient()

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
	plugins: [openAPI(), username(), admin(), organization()],
	basePath: '/api/auth'
})

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
