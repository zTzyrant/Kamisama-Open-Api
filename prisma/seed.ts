import { PrismaClient, User } from '@prisma/client'
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
		await prisma.profile.upsert({
			where: { userId: user.user.id },
			update: {
				bio: 'The supreme being, creator of all.',
				avatar: 'https://example.com/kamisama-avatar.jpg',
				socials: [
					{
						media: 'twitter',
						url: '@kamisama_official'
					}
				]
			},
			create: {
				userId: user.user.id,
				bio: 'The supreme being, creator of all.',
				avatar: 'https://example.com/kamisama-avatar.jpg',
				socials: [
					{
						media: 'twitter',
						url: '@kamisama_official'
					}
				]
			}
		})
		console.log('Kamisama profile ensured.')
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

	const createdCategories = []
	for (const cat of categoriesData) {
		const category = await prisma.category.upsert({
			where: { slug: cat.slug },
			update: {},
			create: cat
		})
		createdCategories.push(category)
	}
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

	const createdTags = []
	for (const tag of tagsData) {
		const newTag = await prisma.tag.upsert({
			where: { slug: tag.slug },
			update: {},
			create: tag
		})
		createdTags.push(newTag)
	}
	console.log('Seeded tags.')
	return createdTags
}

const seedArticleStatuses = async () => {
	console.log('Seeding article statuses...')
	const statusesData = [
		{ name: 'Draft', slug: 'draft' },
		{ name: 'Published', slug: 'published' },
		{ name: 'Archived', slug: 'archived' }
	]

	const createdStatuses = []
	for (const status of statusesData) {
		const newStatus = await prisma.articleStatus.upsert({
			where: { slug: status.slug },
			update: {},
			create: status
		})
		createdStatuses.push(newStatus)
	}
	console.log('Seeded article statuses.')
	return createdStatuses
}

const seedLanguages = async () => {
	console.log('Seeding languages...')
	const languagesData = [
		{ name: 'Indonesian', slug: 'id' },
		{ name: 'English', slug: 'en' }
	]

	const createdLanguages = []
	for (const lang of languagesData) {
		const newLang = await prisma.language.upsert({
			where: { slug: lang.slug },
			update: {},
			create: lang
		})
		createdLanguages.push(newLang)
	}
	console.log('Seeded languages.')
	return createdLanguages
}

const seedArticles = async (
	authorId: string,
	categories: any[],
	tags: any[],
	articleStatuses: any[],
	languages: any[]
) => {
	console.log('Seeding articles...')
	const articlesData = [
		{
			title: 'The Ultimate Guide to TypeScript',
			slug: 'ultimate-guide-to-typescript',
			content:
				'This is a deep dive into the world of TypeScript, exploring its features, benefits, and best practices.',
			excerpt:
				'Learn everything you need to know about TypeScript in this comprehensive guide.',
			statusId: articleStatuses.find((s) => s.slug === 'published').id,
			langId: languages.find((l) => l.slug === 'en').id,
			publishedAt: new Date(),
			categoryId: categories.find((c) => c.slug === 'programming').id,
			tagIds: [
				tags.find((t) => t.slug === 'typescript').id,
				tags.find((t) => t.slug === 'javascript').id
			]
		},
		{
			title: 'Boosting Productivity for Developers',
			slug: 'boosting-productivity-for-developers',
			content:
				'Discover tips and tricks to enhance your productivity as a software developer. From tools to techniques, we cover it all.',
			excerpt:
				'Stop wasting time and start coding more efficiently with these productivity hacks.',
			statusId: articleStatuses.find((s) => s.slug === 'published').id,
			langId: languages.find((l) => l.slug === 'en').id,
			publishedAt: new Date(),
			categoryId: categories.find((c) => c.slug === 'lifestyle').id,
			tagIds: [tags.find((t) => t.slug === 'productivity').id]
		},
		{
			title: 'Getting Started with Node.js',
			slug: 'getting-started-with-nodejs',
			content:
				'A beginner-friendly introduction to Node.js. We will build a simple web server from scratch.',
			excerpt: 'Your first steps into backend development with Node.js.',
			statusId: articleStatuses.find((s) => s.slug === 'draft').id,
			langId: languages.find((l) => l.slug === 'en').id,
			categoryId: categories.find((c) => c.slug === 'programming').id,
			tagIds: [
				tags.find((t) => t.slug === 'nodejs').id,
				tags.find((t) => t.slug === 'javascript').id
			]
		}
	]

	for (const article of articlesData) {
		await prisma.article.upsert({
			where: { slug: article.slug },
			update: {},
			create: {
				...article,
				authorId: authorId
			}
		})
	}
	console.log('Seeded articles successfully.')
}

async function main() {
	await cleanDb()
	const kamisama = await seedKamisama()
	const categories = await seedCategories()
	const tags = await seedTags()
	const articleStatuses = await seedArticleStatuses()
	const languages = await seedLanguages()
	await seedArticles(kamisama.id, categories, tags, articleStatuses, languages)

	console.log('\nSeeding finished successfully! 🌱')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
