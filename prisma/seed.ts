import { PrismaClient } from '@prisma/client'
import { auth } from '../src/libs/auth'

const prisma = new PrismaClient()

// FUNGSI BARU UNTUK MEMBERSIHKAN DATABASE
const cleanDb = async () => {
	console.log('Cleaning the database...')
	try {
		await prisma.$transaction([
			prisma.articleView.deleteMany({}),
			prisma.profile.deleteMany({}),
			prisma.member.deleteMany({}),
			prisma.invitation.deleteMany({}),
			prisma.session.deleteMany({}),
			prisma.account.deleteMany({}),
			prisma.article.deleteMany({}),
			prisma.tag.deleteMany({}),
			prisma.category.deleteMany({}),
			prisma.organization.deleteMany({}),
			prisma.user.deleteMany({}),
			prisma.verification.deleteMany({})
		])
		console.log('Database cleaned successfully.')
	} catch (error) {
		console.error('Error cleaning database:', error)
		throw error
	}
}

const seedKamisama = async () => {
	console.log('Seeding kamisama user...')
	const kamisamaEmail = 'katachinx@gmail.com'
	try {
		const user = await auth.api.createUser({
			body: {
				name: 'kamisama',
				email: kamisamaEmail,
				password: 'kamisama',
				role: 'kamisama',
				data: {
					username: 'kamisama'
				}
			}
		})
		console.log('Successfully created user:', user.user.name)
		return user.user
	} catch (error: any) {
		if (error.code === 'P2002') {
			console.log(
				'User with this email already exists. Fetching existing user...'
			)
			const existingUser = await prisma.user.findUnique({
				where: { email: kamisamaEmail }
			})
			if (!existingUser) {
				throw new Error(
					`User with email ${kamisamaEmail} should exist but was not found.`
				)
			}
			console.log('Found existing user:', existingUser.name)
			return existingUser
		} else {
			console.error('Error creating or fetching user:', error)
			throw error
		}
	}
}

const seedCategories = async () => {
	console.log('Seeding categories...')
	const categoriesData = [
		{ name: 'Technology', slug: 'technology' },
		{ name: 'Programming', slug: 'programming' },
		{ name: 'Lifestyle', slug: 'lifestyle' }
	]
	const createdCategories = await Promise.all(
		categoriesData.map((cat) =>
			prisma.category.upsert({
				where: { slug: cat.slug },
				update: {},
				create: cat
			})
		)
	)
	console.log('Seeded categories.')
	return createdCategories
}

const seedTags = async () => {
	console.log('Seeding tags...')
	const tagsData = [
		{ name: 'JavaScript', slug: 'javascript' },
		{ name: 'TypeScript', slug: 'typescript' },
		{ name: 'Node.js', slug: 'nodejs' },
		{ name: 'Productivity', slug: 'productivity' }
	]
	const createdTags = await Promise.all(
		tagsData.map((tag) =>
			prisma.tag.upsert({
				where: { slug: tag.slug },
				update: {},
				create: tag
			})
		)
	)
	console.log('Seeded tags.')
	return createdTags
}

const seedArticles = async (
	authorId: string,
	categories: any[],
	tags: any[]
) => {
	console.log('Seeding articles...')
	const articlesData = [
		{
			title: 'The Ultimate Guide to TypeScript',
			slug: 'ultimate-guide-to-typescript',
			content: 'This is a deep dive into the world of TypeScript...',
			excerpt: 'Learn everything you need to know about TypeScript...',
			status: 'PUBLISHED',
			publishedAt: new Date(),
			categoryId: categories.find((c) => c.slug === 'programming')?.id,
			tagIds: [
				tags.find((t) => t.slug === 'typescript')?.id,
				tags.find((t) => t.slug === 'javascript')?.id
			].filter(Boolean)
		},
		{
			title: 'Boosting Productivity for Developers',
			slug: 'boosting-productivity-for-developers',
			content: 'Discover tips and tricks to enhance your productivity...',
			excerpt: 'Stop wasting time and start coding more efficiently...',
			status: 'PUBLISHED',
			publishedAt: new Date(),
			categoryId: categories.find((c) => c.slug === 'lifestyle')?.id,
			tagIds: [tags.find((t) => t.slug === 'productivity')?.id].filter(Boolean)
		}
	]

	for (const article of articlesData) {
		if (!article.categoryId) {
			console.warn(
				`Skipping article "${article.title}" due to missing category.`
			)
			continue
		}
		await prisma.article.upsert({
			where: { slug: article.slug },
			update: {},
			create: {
				title: article.title,
				slug: article.slug,
				content: article.content,
				excerpt: article.excerpt,
				status: article.status,
				publishedAt: article.publishedAt,
				authorId: authorId,
				categoryId: article.categoryId,
				tagIds: article.tagIds as string[]
			}
		})
	}
	console.log('Seeded articles successfully.')
}

async function main() {
	await cleanDb() // BERSIHKAN DB SEBELUM SEEDING

	const kamisama = await seedKamisama()
	if (!kamisama) {
		console.error('Could not create or find kamisama user. Aborting seed.')
		process.exit(1)
	}

	const categories = await seedCategories()
	const tags = await seedTags()
	await seedArticles(kamisama.id, categories, tags)

	console.log('\nSeeding finished successfully! 🌱')
}

main()
	.catch((e) => {
		console.error('An error occurred during the seed process:')
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
