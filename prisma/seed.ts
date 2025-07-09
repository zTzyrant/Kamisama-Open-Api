import { PrismaClient } from '@prisma/client'
import { auth } from '../src/libs/auth'

const prisma = new PrismaClient()

const seedKamisama = async () => {
	console.log('Seeding kamisama user...')
	try {
		const user = await auth.api.createUser({
			body: {
				name: 'kamisama',
				email: 'katachinx@gmail.com',
				password: 'kamisama',
				role: 'kamisama',
				data: {
					username: 'kamisama'
				}
			}
		})
		console.log('Successfully created user:', user)
	} catch (error: any) {
		// Prisma's unique constraint violation code for MongoDB
		if (error.code === 'P2002') {
			console.log('User with this email already exists. Skipping.')
		} else {
			console.error('Error creating user:', error)
			throw error // re-throw error to fail the seed script
		}
	}
}

async function main() {
	await seedKamisama()
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
