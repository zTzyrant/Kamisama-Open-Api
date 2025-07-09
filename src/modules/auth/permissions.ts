import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statement = {
	...defaultStatements,
	project: [
		'create',
		'read',
		'update',
		'delete',
		'approve',
		'suspend',
		'unapprove',
		'set-role-to-user',
		'set-role-to-admin',
		'set-role-to-super'
	]
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({
	project: ['create', 'read', 'update', 'delete']
})

export const admin = ac.newRole({
	project: [
		'create',
		'read',
		'update',
		'delete',
		'approve',
		'suspend',
		'unapprove'
	],
	...adminAc.statements
})

export const superAdmin = ac.newRole({
	project: [
		'create',
		'read',
		'update',
		'delete',
		'approve',
		'suspend',
		'unapprove',
		'set-role-to-user',
		'set-role-to-admin'
	],
	...adminAc.statements
})

export const kamisama = ac.newRole({
	project: [
		'create',
		'read',
		'update',
		'delete',
		'approve',
		'suspend',
		'unapprove',
		'set-role-to-user',
		'set-role-to-admin',
		'set-role-to-super'
	],
	...adminAc.statements
})
