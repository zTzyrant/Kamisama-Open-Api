import { auth } from '../../libs/auth'
type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>
export type BetterAuthUser = NonNullable<SessionData>['user']
export type BetterAuthSession = NonNullable<SessionData>['session']
