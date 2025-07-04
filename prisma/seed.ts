import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
	const roles = [
		{
			name: 'superadmin',
			description: 'Full access to all features, including role management.'
		},
		{
			name: 'admin',
			description: 'Administrative access to manage users and content.'
		},
		{
			name: 'user',
			description: 'Standard user access with basic permissions.'
		}
	]

	for (const roleData of roles) {
		const result = await prisma.role.upsert({
			where: { name: roleData.name },
			update: {},
			create: roleData
		})
		console.log(`Upserted role: ${result.name}`)
	}
	console.log('Roles seeded successfully!')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
